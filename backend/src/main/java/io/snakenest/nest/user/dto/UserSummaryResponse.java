package io.snakenest.nest.user.dto;

import java.util.UUID;

public record UserSummaryResponse(UUID userId, String displayName, String avatar) {
}
