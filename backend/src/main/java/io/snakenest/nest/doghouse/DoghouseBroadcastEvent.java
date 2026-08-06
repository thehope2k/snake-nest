package io.snakenest.nest.doghouse;

import io.snakenest.nest.doghouse.dto.DoghouseEvent;
import java.util.UUID;

public record DoghouseBroadcastEvent(UUID nestId, DoghouseEvent payload) {
}
