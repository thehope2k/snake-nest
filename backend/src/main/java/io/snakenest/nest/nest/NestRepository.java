package io.snakenest.nest.nest;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NestRepository extends JpaRepository<Nest, UUID> {

    List<Nest> findByIdIn(List<UUID> ids);

    List<Nest> findByIdInAndNameIsNull(List<UUID> ids);

    Optional<Nest> findByInviteCode(String inviteCode);
}
