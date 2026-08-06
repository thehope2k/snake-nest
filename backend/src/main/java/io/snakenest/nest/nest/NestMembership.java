package io.snakenest.nest.nest;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "nest_membership", uniqueConstraints = @UniqueConstraint(columnNames = {"nest_id", "user_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NestMembership {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "nest_id", nullable = false)
    private UUID nestId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private Instant joinedAt = Instant.now();

    public NestMembership(UUID nestId, UUID userId) {
        this.nestId = nestId;
        this.userId = userId;
    }
}
