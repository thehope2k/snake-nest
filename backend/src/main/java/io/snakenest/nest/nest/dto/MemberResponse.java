package io.snakenest.nest.nest.dto;

import java.util.UUID;

public record MemberResponse(UUID userId, String displayName, String avatar) {
}
