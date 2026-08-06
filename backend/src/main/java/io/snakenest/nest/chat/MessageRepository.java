package io.snakenest.nest.chat;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    List<Message> findByNestIdOrderByCreatedAtDesc(UUID nestId, Limit limit);

    List<Message> findByNestIdAndCreatedAtLessThanOrderByCreatedAtDesc(UUID nestId, Instant before, Limit limit);

}
