package io.snakenest.nest.chat;

import io.snakenest.nest.chat.dto.ChatEvent;
import java.util.UUID;

public record ChatBroadcastEvent(UUID nestId, ChatEvent payload) {
}
