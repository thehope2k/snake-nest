package io.snakenest.nest.doghouse.dto;

import java.util.UUID;

/** Per-member Doghouse state for a Nest, used to seed the UI on load/refresh. */
public record DoghouseStateResponse(UUID userId, Long benchedUntil, Long cooldownUntil, int sentCount) {
}
