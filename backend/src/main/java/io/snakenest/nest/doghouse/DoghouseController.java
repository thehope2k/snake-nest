package io.snakenest.nest.doghouse;

import io.snakenest.nest.common.ApiPaths;
import io.snakenest.nest.doghouse.dto.DoghouseRejection;
import io.snakenest.nest.doghouse.dto.DoghouseStateResponse;
import io.snakenest.nest.doghouse.dto.SendToDoghouseResponse;
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
@RequestMapping(ApiPaths.V1 + "/nests/{nestId}/doghouse")
@RequiredArgsConstructor
public class DoghouseController {

    private final DoghouseService doghouseService;

    @PostMapping("/{targetUserId}/send")
    public ResponseEntity<SendToDoghouseResponse> send(
            @PathVariable UUID nestId, @PathVariable UUID targetUserId, Authentication auth) {
        DoghouseRejection rejection = doghouseService.sendToDoghouse(nestId, userId(auth), targetUserId);
        return ResponseEntity.ok(rejection == null
                ? SendToDoghouseResponse.success()
                : SendToDoghouseResponse.rejected(rejection));
    }

    @PostMapping("/{targetUserId}/release")
    public ResponseEntity<Void> release(
            @PathVariable UUID nestId, @PathVariable UUID targetUserId, Authentication auth) {
        doghouseService.releaseFromDoghouse(nestId, userId(auth), targetUserId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<DoghouseStateResponse>> state(@PathVariable UUID nestId, Authentication auth) {
        return ResponseEntity.ok(doghouseService.currentState(nestId, userId(auth)));
    }

    private UUID userId(Authentication auth) {
        return (UUID) auth.getPrincipal();
    }
}
