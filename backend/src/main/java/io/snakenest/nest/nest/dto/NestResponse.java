package io.snakenest.nest.nest.dto;

import java.util.List;
import java.util.UUID;

public record NestResponse(UUID id, String name, String icon, UUID ownerId, List<UUID> memberIds) {
}
