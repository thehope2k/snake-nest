package io.snakenest.nest.meet;

import io.snakenest.nest.meet.dto.MeetEvent;
import java.util.UUID;

public record MeetBroadcastEvent(UUID nestId, MeetEvent payload) {
}
