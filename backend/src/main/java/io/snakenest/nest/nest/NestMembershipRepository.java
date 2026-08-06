package io.snakenest.nest.nest;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NestMembershipRepository extends JpaRepository<NestMembership, UUID> {

    List<NestMembership> findByUserId(UUID userId);

    List<NestMembership> findByNestId(UUID nestId);

    Optional<NestMembership> findByNestIdAndUserId(UUID nestId, UUID userId);

    boolean existsByNestIdAndUserId(UUID nestId, UUID userId);

    void deleteByNestIdAndUserId(UUID nestId, UUID userId);
}
