package io.snakenest.nest.auth;

import io.snakenest.nest.auth.dto.AuthResponse;
import io.snakenest.nest.auth.dto.LoginRequest;
import io.snakenest.nest.auth.dto.RegisterRequest;
import io.snakenest.nest.common.ApiException;
import io.snakenest.nest.user.User;
import io.snakenest.nest.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }
        User user = new User(
                request.email(),
                passwordEncoder.encode(request.password()),
                request.displayName(),
                avatarFor(request.displayName()));
        userRepository.save(user);
        log.info("User registered: {}", user.getId());
        return toAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return toAuthResponse(user);
    }

    private AuthResponse toAuthResponse(User user) {
        String token = jwtService.issueToken(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getDisplayName(), user.getAvatar());
    }

    private String avatarFor(String displayName) {
        String trimmed = displayName.trim();
        return trimmed.isEmpty() ? "🐍" : trimmed.substring(0, 1).toUpperCase();
    }
}
