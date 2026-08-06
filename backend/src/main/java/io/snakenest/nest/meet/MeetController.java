package io.snakenest.nest.meet;

import io.snakenest.nest.common.ApiPaths;
import io.snakenest.nest.meet.dto.JoinMeetResponse;
import io.snakenest.nest.meet.dto.ParticipantResponse;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPaths.V1 + "/nests/{nestId}/meet")
@RequiredArgsConstructor
public class MeetController {

    private final MeetService meetService;

    @PostMapping("/join")
    public ResponseEntity<JoinMeetResponse> join(@PathVariable UUID nestId, Authentication auth) {
        return ResponseEntity.ok(meetService.join(nestId, userId(auth)));
    }

    @PostMapping("/leave")
    public ResponseEntity<Void> leave(@PathVariable UUID nestId, Authentication auth) {
        meetService.leave(nestId, userId(auth));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/participants")
    public ResponseEntity<List<ParticipantResponse>> listParticipants(@PathVariable UUID nestId, Authentication auth) {
        return ResponseEntity.ok(meetService.listParticipants(nestId, userId(auth)));
    }

    private UUID userId(Authentication auth) {
        return (UUID) auth.getPrincipal();
    }
}
