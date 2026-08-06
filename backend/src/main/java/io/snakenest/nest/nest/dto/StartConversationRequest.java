package io.snakenest.nest.nest.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.UUID;

public record StartConversationRequest(@NotEmpty List<UUID> participantUserIds) {
}
