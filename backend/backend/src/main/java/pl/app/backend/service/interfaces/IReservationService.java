package pl.app.backend.service.interfaces;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import pl.app.backend.dto.reservation.AdminReservationUpdateRequest;
import pl.app.backend.dto.reservation.ReservationRequest;
import pl.app.backend.dto.reservation.ReservationResponse;
import pl.app.backend.dto.reservation.TimeSlotAvailabilityResponse;

import java.time.LocalDate;
import java.util.List;

public interface IReservationService {
    ReservationResponse createReservation(ReservationRequest request);
    void confirmReservation(String token);
    void cancelReservation(String token);
    List<TimeSlotAvailabilityResponse> getAvailability(LocalDate date, int partySize);
    Page<ReservationResponse> getAllReservations(Pageable pageable);
    ReservationResponse updateReservation(Long id, AdminReservationUpdateRequest request);
    void deleteReservation(Long id);
}
