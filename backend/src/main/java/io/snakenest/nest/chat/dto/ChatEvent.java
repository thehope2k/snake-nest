package io.snakenest.nest.chat.dto;

public record ChatEvent(String type, MessageResponse message) {

    public static ChatEvent messageCreated(MessageResponse message) {
        return new ChatEvent("message-created", message);
    }

    public static ChatEvent reactionUpdated(MessageResponse message) {
        return new ChatEvent("reaction-updated", message);
    }
}
