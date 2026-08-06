package io.snakenest.nest.user;

import io.snakenest.nest.common.ApiPaths;
import io.snakenest.nest.user.dto.UserSummaryResponse;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPaths.V1 + "/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/search")
    public ResponseEntity<List<UserSummaryResponse>> search(
            @RequestParam(defaultValue = "") String query, Authentication auth) {
        UUID selfId = (UUID) auth.getPrincipal();
        String needle = query.trim().toLowerCase();
        List<UserSummaryResponse> results = userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(selfId))
                .filter(user -> needle.isEmpty() || user.getDisplayName().toLowerCase().contains(needle))
                .map(user -> new UserSummaryResponse(user.getId(), user.getDisplayName(), user.getAvatar()))
                .toList();
        return ResponseEntity.ok(results);
    }
}
