package io.snakenest.nest.meet.dto;

import java.util.UUID;

public record MeetEvent(String type, UUID participantId) {

    public static MeetEvent participantJoined(UUID participantId) {
        return new MeetEvent("participant-joined", participantId);
    }

    public static MeetEvent participantLeft(UUID participantId) {
        return new MeetEvent("participant-left", participantId);
    }
}
