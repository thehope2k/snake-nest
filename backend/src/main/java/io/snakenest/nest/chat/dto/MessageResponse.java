package io.snakenest.nest.chat.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        UUID nestId,
        UUID authorId,
        String text,
        UUID replyToId,
        Instant createdAt,
        List<ReactionSummary> reactions) {
}
