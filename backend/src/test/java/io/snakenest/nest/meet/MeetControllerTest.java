package io.snakenest.nest.meet;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.snakenest.nest.meet.dto.JoinMeetResponse;
import io.snakenest.nest.meet.dto.ParticipantResponse;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

class MeetControllerTest {

    private final UUID nestId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();
    private final MeetService meetService = mock(MeetService.class);
    private final MeetController controller = new MeetController(meetService);

    @Test
    void joinDelegatesToServiceWithTheAuthenticatedUserId() {
        Authentication auth = authenticationFor(userId);
        JoinMeetResponse expected = new JoinMeetResponse("token", "ws://localhost:7880", List.of());
        when(meetService.join(nestId, userId)).thenReturn(expected);

        ResponseEntity<JoinMeetResponse> response = controller.join(nestId, auth);

        assertThat(response.getBody()).isEqualTo(expected);
    }

    @Test
    void leaveReturnsNoContent() {
        Authentication auth = authenticationFor(userId);

        ResponseEntity<Void> response = controller.leave(nestId, auth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(meetService).leave(nestId, userId);
    }

    @Test
    void listParticipantsReturnsWhatTheServiceProvides() {
        Authentication auth = authenticationFor(userId);
        List<ParticipantResponse> participants = List.of(new ParticipantResponse(userId, Instant.now()));
        when(meetService.listParticipants(nestId, userId)).thenReturn(participants);

        ResponseEntity<List<ParticipantResponse>> response = controller.listParticipants(nestId, auth);

        assertThat(response.getBody()).isEqualTo(participants);
    }

    private Authentication authenticationFor(UUID userId) {
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(userId);
        return auth;
    }
}
