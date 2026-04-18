package pl.app.backend.service.interfaces;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import pl.app.backend.dto.reservation.AdminReservationUpdateRequest;
import pl.app.backend.dto.reservation.ReservationRequest;
import pl.app.backend.dto.reservation.ReservationResponse;

public interface IReservationService {
    ReservationResponse createReservation(ReservationRequest request);
    void confirmReservation(String token);
    void cancelReservation(String token);
    Page<ReservationResponse> getAllReservations(Pageable pageable);
    ReservationResponse updateReservation(Long id, AdminReservationUpdateRequest request);
    void deleteReservation(Long id);
}
