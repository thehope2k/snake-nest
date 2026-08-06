package io.snakenest.nest.chat;

import io.snakenest.nest.chat.dto.MessageResponse;
import io.snakenest.nest.chat.dto.SendMessageRequest;
import io.snakenest.nest.chat.dto.ToggleReactionRequest;
import io.snakenest.nest.common.ApiPaths;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping(ApiPaths.V1 + "/nests/{nestId}/messages")
    public ResponseEntity<List<MessageResponse>> listMessages(
            @PathVariable UUID nestId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant before,
            @RequestParam(required = false) Integer limit,
            Authentication auth) {
        return ResponseEntity.ok(chatService.listMessages(nestId, userId(auth), before, limit));
    }

    @PostMapping(ApiPaths.V1 + "/nests/{nestId}/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable UUID nestId, @Valid @RequestBody SendMessageRequest request, Authentication auth) {
        return ResponseEntity.ok(chatService.sendMessage(nestId, userId(auth), request));
    }

    @PostMapping(ApiPaths.V1 + "/messages/{messageId}/reactions")
    public ResponseEntity<MessageResponse> toggleReaction(
            @PathVariable UUID messageId, @Valid @RequestBody ToggleReactionRequest request, Authentication auth) {
        return ResponseEntity.ok(chatService.toggleReaction(messageId, userId(auth), request.emoji()));
    }

    private UUID userId(Authentication auth) {
        return (UUID) auth.getPrincipal();
    }
}
