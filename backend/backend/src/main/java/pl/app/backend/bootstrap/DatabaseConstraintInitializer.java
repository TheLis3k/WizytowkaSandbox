package pl.app.backend.bootstrap;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseConstraintInitializer {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void applyConstraints() {
        enableBtreeGist();
        applyReservationExcludeConstraint();
    }

    private void enableBtreeGist() {
        try {
            jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS btree_gist");
        } catch (Exception e) {
            log.warn("Nie udało się aktywować rozszerzenia btree_gist: {}", e.getMessage());
        }
    }

    private void applyReservationExcludeConstraint() {
        try {
            jdbcTemplate.execute("""
                DO $$ BEGIN
                  IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'no_overlap_reservation'
                  ) THEN
                    ALTER TABLE reservations ADD CONSTRAINT no_overlap_reservation
                    EXCLUDE USING GIST (
                      table_id WITH =,
                      tsrange(start_time, start_time + (duration_minutes * interval '1 minute'), '[)') WITH &&
                    )
                    WHERE (status IN ('PENDING_CONFIRMATION', 'CONFIRMED'));
                  END IF;
                END $$
                """);
            log.info("Constraint no_overlap_reservation gotowy");
        } catch (Exception e) {
            log.error("Nie udało się utworzyć constraint no_overlap_reservation: {}", e.getMessage());
        }
    }
}
