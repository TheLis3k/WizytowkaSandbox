package pl.app.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.app.backend.entity.ContactMessage;
import pl.app.backend.enums.ContactMessageStatus;

import java.time.Instant;
import java.util.Optional;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    Optional<ContactMessage> findByVerificationTokenHash(String tokenHash);

    Page<ContactMessage> findByStatusNot(ContactMessageStatus status, Pageable pageable);

    Page<ContactMessage> findByStatus(ContactMessageStatus status, Pageable pageable);

    long countByStatus(ContactMessageStatus status);

    @Modifying
    @Query("DELETE FROM ContactMessage c WHERE c.status = :status AND c.verificationExpiresAt < :now")
    int deleteExpiredPending(@Param("status") ContactMessageStatus status, @Param("now") Instant now);
}
