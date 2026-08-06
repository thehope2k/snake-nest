package io.snakenest.nest.meet.dto;

import java.util.List;

public record JoinMeetResponse(String token, String livekitUrl, List<ParticipantResponse> participants) {
}
