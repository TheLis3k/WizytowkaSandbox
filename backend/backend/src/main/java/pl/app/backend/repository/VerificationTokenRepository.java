package pl.app.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.app.backend.entity.VerificationToken;
import pl.app.backend.enums.VerificationTokenType;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    Optional<VerificationToken> findByTokenHash(String tokenHash);

    void deleteByUserIdAndType(Long userId, VerificationTokenType type);
}