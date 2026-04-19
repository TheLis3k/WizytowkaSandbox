package pl.app.backend.controller.open;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.app.backend.dto.reservation.ReservationRequest;
import pl.app.backend.dto.reservation.ReservationResponse;
import pl.app.backend.dto.reservation.TimeSlotAvailabilityResponse;
import pl.app.backend.service.interfaces.IReservationService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/public/reservations")
@RequiredArgsConstructor
public class ReservationPublicController {

    private final IReservationService reservationService;

    @GetMapping("/availability")
    public ResponseEntity<List<TimeSlotAvailabilityResponse>> getAvailability(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @Min(1) @Max(20) int partySize) {
        return ResponseEntity.ok(reservationService.getAvailability(date, partySize));
    }

    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(@Valid @RequestBody ReservationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservationService.createReservation(request));
    }

    @PostMapping("/confirm")
    public ResponseEntity<Void> confirmReservation(@RequestParam String token) {
        reservationService.confirmReservation(token);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/cancel")
    public ResponseEntity<Void> cancelReservation(@RequestParam String token) {
        reservationService.cancelReservation(token);
        return ResponseEntity.ok().build();
    }
}
