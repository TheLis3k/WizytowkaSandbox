package pl.app.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pl.app.backend.entity.Reservation;
import pl.app.backend.enums.ReservationStatus;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Page<Reservation> findAll(Pageable pageable);

    Optional<Reservation> findByConfirmationTokenHash(String tokenHash);

    Optional<Reservation> findByCancellationTokenHash(String tokenHash);

    @Query("SELECT r FROM Reservation r WHERE r.startTime >= :start AND r.startTime < :end AND r.status IN :statuses")
    List<Reservation> findActiveByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("statuses") List<ReservationStatus> statuses);

    @Modifying
    @Query("UPDATE Reservation r SET r.status = 'EXPIRED' WHERE r.status = 'PENDING_CONFIRMATION' AND r.confirmationExpiresAt < :now")
    int expireUnconfirmed(Instant now);
}
