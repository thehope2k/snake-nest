package io.snakenest.nest.meet;

import io.livekit.server.WebhookReceiver;
import io.snakenest.nest.common.ApiPaths;
import java.util.UUID;
import livekit.LivekitWebhook;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
public class LiveKitWebhookController {

    private static final String PARTICIPANT_LEFT = "participant_left";
    private static final String ROOM_FINISHED = "room_finished";

    private final MeetService meetService;
    private final WebhookReceiver webhookReceiver;

    public LiveKitWebhookController(
            MeetService meetService,
            @Value("${nest.livekit.api-key}") String livekitApiKey,
            @Value("${nest.livekit.api-secret}") String livekitApiSecret) {
        this.meetService = meetService;
        this.webhookReceiver = new WebhookReceiver(livekitApiKey, livekitApiSecret);
    }

    @PostMapping(value = ApiPaths.V1 + "/webhooks/livekit", consumes = "application/webhook+json")
    public ResponseEntity<Void> receive(@RequestHeader("Authorization") String authHeader, @RequestBody String body) {
        LivekitWebhook.WebhookEvent event;
        try {
            event = webhookReceiver.receive(body, authHeader);
        } catch (RuntimeException exception) {
            log.warn("Rejected LiveKit webhook: {}", exception.getMessage());
            return ResponseEntity.badRequest().build();
        }

        UUID nestId = MeetService.nestIdFromRoomName(event.getRoom().getName());
        if (nestId == null) return ResponseEntity.ok().build();

        switch (event.getEvent()) {
            case PARTICIPANT_LEFT -> reconcileParticipantLeft(nestId, event);
            case ROOM_FINISHED -> meetService.clearAllParticipants(nestId);
            default -> { }
        }
        return ResponseEntity.ok().build();
    }

    private void reconcileParticipantLeft(UUID nestId, LivekitWebhook.WebhookEvent event) {
        try {
            meetService.removeParticipant(nestId, UUID.fromString(event.getParticipant().getIdentity()));
        } catch (IllegalArgumentException exception) {
            log.warn("Ignored LiveKit webhook for Nest {}: malformed participant identity", nestId);
        }
    }
}
