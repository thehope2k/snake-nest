package io.snakenest.nest.meet;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

class LiveKitWebhookControllerTest {

    private static final String API_KEY = "devkey";
    private static final String API_SECRET = "01234567890123456789012345678901";

    private final UUID nestId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();
    private final MeetService meetService = mock(MeetService.class);
    private final LiveKitWebhookController controller =
            new LiveKitWebhookController(meetService, API_KEY, API_SECRET);

    @Test
    void rejectsAWebhookWithATamperedBody() {
        String body = participantLeftBody(nestId, userId);
        String signedForADifferentBody = signedAuthHeader("{\"event\":\"room_started\"}");

        ResponseEntity<Void> response = controller.receive(signedForADifferentBody, body);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(meetService, never()).removeParticipant(eq(nestId), eq(userId));
    }

    @Test
    void reconcilesAParticipantLeftEventForAKnownNest() {
        String body = participantLeftBody(nestId, userId);
        String authHeader = signedAuthHeader(body);

        ResponseEntity<Void> response = controller.receive(authHeader, body);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(meetService).removeParticipant(nestId, userId);
    }

    @Test
    void clearsPresenceOnRoomFinished() {
        String body = "{\"event\":\"room_finished\",\"room\":{\"name\":\"nest-" + nestId + "\"}}";
        String authHeader = signedAuthHeader(body);

        controller.receive(authHeader, body);

        verify(meetService).clearAllParticipants(nestId);
    }

    @Test
    void ignoresEventsForRoomsNotOwnedByMeet() {
        String body = "{\"event\":\"room_finished\",\"room\":{\"name\":\"some-other-room\"}}";
        String authHeader = signedAuthHeader(body);

        ResponseEntity<Void> response = controller.receive(authHeader, body);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(meetService, never()).clearAllParticipants(nestId);
    }

    private String participantLeftBody(UUID nestId, UUID userId) {
        return "{\"event\":\"participant_left\",\"room\":{\"name\":\"nest-" + nestId + "\"},"
                + "\"participant\":{\"identity\":\"" + userId + "\"}}";
    }

    private String signedAuthHeader(String body) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String bodyHash = Base64.getEncoder().encodeToString(digest.digest(body.getBytes(StandardCharsets.UTF_8)));
            return JWT.create()
                    .withIssuer(API_KEY)
                    .withClaim("sha256", bodyHash)
                    .sign(Algorithm.HMAC256(API_SECRET));
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }
}
