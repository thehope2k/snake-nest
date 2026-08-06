package io.snakenest.nest.nest;

import io.snakenest.nest.common.ApiPaths;
import io.snakenest.nest.nest.dto.AddMemberRequest;
import io.snakenest.nest.nest.dto.CreateNestRequest;
import io.snakenest.nest.nest.dto.InviteCodeResponse;
import io.snakenest.nest.nest.dto.JoinNestRequest;
import io.snakenest.nest.nest.dto.MemberResponse;
import io.snakenest.nest.nest.dto.NestResponse;
import io.snakenest.nest.nest.dto.RenameNestRequest;
import io.snakenest.nest.nest.dto.StartConversationRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPaths.V1 + "/nests")
@RequiredArgsConstructor
public class NestController {

    private final NestService nestService;

    @PostMapping
    public ResponseEntity<NestResponse> create(@Valid @RequestBody CreateNestRequest request, Authentication auth) {
        return ResponseEntity.ok(nestService.createNest(userId(auth), request));
    }

    @GetMapping
    public ResponseEntity<List<NestResponse>> listMine(Authentication auth) {
        return ResponseEntity.ok(nestService.listMyNests(userId(auth)));
    }

    @PostMapping("/start")
    public ResponseEntity<NestResponse> start(@Valid @RequestBody StartConversationRequest request, Authentication auth) {
        return ResponseEntity.ok(nestService.startConversation(userId(auth), request.participantUserIds()));
    }

    @PatchMapping("/{nestId}")
    public ResponseEntity<NestResponse> rename(
            @PathVariable UUID nestId, @RequestBody RenameNestRequest request, Authentication auth) {
        return ResponseEntity.ok(nestService.rename(nestId, userId(auth), request));
    }

    @GetMapping("/{nestId}")
    public ResponseEntity<NestResponse> get(@PathVariable UUID nestId, Authentication auth) {
        return ResponseEntity.ok(nestService.getNest(nestId, userId(auth)));
    }

    @GetMapping("/{nestId}/members")
    public ResponseEntity<List<MemberResponse>> listMembers(@PathVariable UUID nestId, Authentication auth) {
        return ResponseEntity.ok(nestService.listMembers(nestId, userId(auth)));
    }

    @GetMapping("/{nestId}/users")
    public ResponseEntity<List<MemberResponse>> searchUsers(
            @PathVariable UUID nestId, @RequestParam(defaultValue = "") String query, Authentication auth) {
        return ResponseEntity.ok(nestService.searchUsers(nestId, userId(auth), query));
    }

    @PostMapping("/{nestId}/members")
    public ResponseEntity<Void> addMember(
            @PathVariable UUID nestId, @Valid @RequestBody AddMemberRequest request, Authentication auth) {
        nestService.addMember(nestId, userId(auth), request.userId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{nestId}/members/{targetUserId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID nestId, @PathVariable UUID targetUserId, Authentication auth) {
        nestService.removeMember(nestId, userId(auth), targetUserId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{nestId}/invite")
    public ResponseEntity<InviteCodeResponse> getInviteCode(@PathVariable UUID nestId, Authentication auth) {
        return ResponseEntity.ok(new InviteCodeResponse(nestService.getInviteCode(nestId, userId(auth))));
    }

    @PostMapping("/join")
    public ResponseEntity<NestResponse> join(@Valid @RequestBody JoinNestRequest request, Authentication auth) {
        return ResponseEntity.ok(nestService.joinByCode(userId(auth), request.code()));
    }

    private UUID userId(Authentication auth) {
        return (UUID) auth.getPrincipal();
    }
}
