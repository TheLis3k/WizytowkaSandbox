package pl.app.backend.controller.open;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.app.backend.dto.reservation.ReservationRequest;
import pl.app.backend.dto.reservation.ReservationResponse;
import pl.app.backend.service.interfaces.IReservationService;

@RestController
@RequestMapping("/api/public/reservations")
@RequiredArgsConstructor
public class ReservationPublicController {

    private final IReservationService reservationService;

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
