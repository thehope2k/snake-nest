package io.snakenest.nest.meet.dto;

import java.time.Instant;
import java.util.UUID;

public record ParticipantResponse(UUID userId, Instant joinedAt) {
}
