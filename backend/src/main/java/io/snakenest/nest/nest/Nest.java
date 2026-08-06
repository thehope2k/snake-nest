package io.snakenest.nest.nest;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "nest")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Nest {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String icon;

    @Column(nullable = false)
    private UUID ownerId;

    @Column(nullable = false, unique = true)
    private String inviteCode;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public Nest(String name, String icon, UUID ownerId, String inviteCode) {
        this.name = name;
        this.icon = icon;
        this.ownerId = ownerId;
        this.inviteCode = inviteCode;
    }
}
