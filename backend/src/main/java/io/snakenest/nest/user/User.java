package io.snakenest.nest.user;

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
@Table(name = "app_user")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String displayName;

    @Column(nullable = false)
    private String avatar;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public User(String email, String passwordHash, String displayName, String avatar) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
        this.avatar = avatar;
    }
}
