package pl.app.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pl.app.backend.dto.reservation.AdminReservationUpdateRequest;
import pl.app.backend.dto.reservation.ReservationRequest;
import pl.app.backend.dto.reservation.ReservationResponse;
import pl.app.backend.dto.reservation.TimeSlotAvailabilityResponse;
import pl.app.backend.entity.Reservation;
import pl.app.backend.entity.RestaurantTable;
import pl.app.backend.enums.ReservationStatus;
import pl.app.backend.repository.ReservationRepository;
import pl.app.backend.repository.RestaurantTableRepository;
import pl.app.backend.security.TokenHasher;
import pl.app.backend.service.interfaces.IEmailService;
import pl.app.backend.service.interfaces.IReservationService;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements IReservationService {

    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;
    private final IEmailService emailService;
    private final TokenHasher tokenHasher;

    @Override
    @Transactional
    public ReservationResponse createReservation(ReservationRequest request) {
        RestaurantTable table = tableRepository.findById(request.tableId())
                .filter(RestaurantTable::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stolik nie został znaleziony"));

        String plainConfirmToken = UUID.randomUUID().toString();
        String plainCancelToken = UUID.randomUUID().toString();

        Reservation reservation = Reservation.builder()
                .table(table)
                .guestName(request.guestName())
                .guestEmail(request.guestEmail())
                .guestPhone(request.guestPhone())
                .partySize(request.partySize())
                .startTime(request.startTime())
                .durationMinutes(90)
                .status(ReservationStatus.PENDING_CONFIRMATION)
                .comments(request.comments())
                .confirmationTokenHash(tokenHasher.hash(plainConfirmToken))
                .confirmationExpiresAt(Instant.now().plusSeconds(15 * 60))
                .cancellationTokenHash(tokenHasher.hash(plainCancelToken))
                .build();

        try {
            reservationRepository.save(reservation);
        } catch (DataIntegrityViolationException e) {
            if (e.getMessage() != null && e.getMessage().contains("no_overlap_reservation")) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Wybrany stolik jest już zajęty w tym terminie");
            }
            throw e;
        }

        emailService.sendReservationConfirmationEmail(request.guestEmail(), request.guestName(), plainConfirmToken, plainCancelToken);
        return toResponse(reservation);
    }

    @Override
    @Transactional
    public void confirmReservation(String token) {
        String tokenHash = tokenHasher.hash(token);
        Reservation reservation = reservationRepository.findByConfirmationTokenHash(tokenHash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nieprawidłowy token potwierdzenia"));

        if (reservation.getStatus() != ReservationStatus.PENDING_CONFIRMATION) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Rezerwacja nie oczekuje na potwierdzenie");
        }
        if (reservation.getConfirmationExpiresAt() == null || Instant.now().isAfter(reservation.getConfirmationExpiresAt())) {
            reservation.setStatus(ReservationStatus.EXPIRED);
            reservationRepository.save(reservation);
            throw new ResponseStatusException(HttpStatus.GONE, "Link potwierdzający wygasł. Złóż nową rezerwację.");
        }

        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation.setConfirmationExpiresAt(null);
        reservationRepository.save(reservation);
        log.info("Rezerwacja {} potwierdzona przez gościa {}", reservation.getId(), reservation.getGuestEmail());
    }

    @Override
    @Transactional
    public void cancelReservation(String token) {
        String tokenHash = tokenHasher.hash(token);
        Reservation reservation = reservationRepository.findByCancellationTokenHash(tokenHash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nieprawidłowy token anulowania"));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Rezerwacja jest już anulowana");
        }
        if (reservation.getStatus() == ReservationStatus.EXPIRED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Rezerwacja wygasła i nie może być anulowana");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
        log.info("Rezerwacja {} anulowana przez gościa {}", reservation.getId(), reservation.getGuestEmail());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeSlotAvailabilityResponse> getAvailability(LocalDate date, int partySize) {
        List<RestaurantTable> qualifying = tableRepository.findByActiveTrue().stream()
                .filter(t -> t.getCapacity() >= partySize)
                .toList();

        List<Reservation> dayReservations = reservationRepository.findActiveByDateRange(
                date.atStartOfDay(),
                date.plusDays(1).atStartOfDay(),
                List.of(ReservationStatus.CONFIRMED, ReservationStatus.PENDING_CONFIRMATION)
        );

        List<TimeSlotAvailabilityResponse> slots = new ArrayList<>();
        LocalTime current = LocalTime.of(10, 0);
        LocalTime last = LocalTime.of(21, 30);

        while (!current.isAfter(last)) {
            LocalDateTime slotStart = date.atTime(current);
            LocalDateTime slotEnd = slotStart.plusMinutes(90);

            List<TimeSlotAvailabilityResponse.AvailableTable> freeTables = qualifying.stream()
                    .filter(table -> dayReservations.stream()
                            .filter(r -> r.getTable().getId().equals(table.getId()))
                            .noneMatch(r -> r.getStartTime().isBefore(slotEnd)
                                    && r.getStartTime().plusMinutes(r.getDurationMinutes()).isAfter(slotStart)))
                    .map(t -> new TimeSlotAvailabilityResponse.AvailableTable(t.getId(), t.getName(), t.getCapacity()))
                    .toList();

            slots.add(new TimeSlotAvailabilityResponse(current.toString(), !freeTables.isEmpty(), freeTables));
            current = current.plusMinutes(30);
        }

        return slots;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservationResponse> getAllReservations(Pageable pageable) {
        return reservationRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public ReservationResponse updateReservation(Long id, AdminReservationUpdateRequest request) {
        Reservation reservation = findById(id);
        if (request.status() != null) {
            reservation.setStatus(request.status());
        }
        if (request.comments() != null) {
            reservation.setComments(request.comments());
        }
        return toResponse(reservationRepository.save(reservation));
    }

    @Override
    @Transactional
    public void deleteReservation(Long id) {
        if (!reservationRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Rezerwacja nie została znaleziona");
        }
        reservationRepository.deleteById(id);
    }

    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void expireUnconfirmed() {
        int count = reservationRepository.expireUnconfirmed(Instant.now());
        if (count > 0) {
            log.info("Wygasło {} niepotwierdzon{} rezerwacj{}", count, count == 1 ? "ą" : "ych", count == 1 ? "ę" : "i");
        }
    }

    private Reservation findById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rezerwacja nie została znaleziona"));
    }

    private ReservationResponse toResponse(Reservation r) {
        return new ReservationResponse(
                r.getId(),
                r.getTable().getId(),
                r.getTable().getName(),
                r.getGuestName(),
                r.getGuestEmail(),
                r.getGuestPhone(),
                r.getPartySize(),
                r.getStartTime(),
                r.getDurationMinutes(),
                r.getStatus(),
                r.getComments(),
                r.getCreatedAt()
        );
    }
}
