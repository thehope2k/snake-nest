package io.snakenest.nest.chat;

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
@Table(name = "message")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Message {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "nest_id", nullable = false)
    private UUID nestId;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(nullable = false)
    private String text;

    @Column(name = "reply_to_id")
    private UUID replyToId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Message(UUID nestId, UUID authorId, String text, UUID replyToId) {
        this.nestId = nestId;
        this.authorId = authorId;
        this.text = text;
        this.replyToId = replyToId;
    }
}
