package io.snakenest.nest.auth.dto;

import static io.snakenest.nest.common.ValidationLimits.DISPLAY_NAME_MAX_LENGTH;
import static io.snakenest.nest.common.ValidationLimits.PASSWORD_MIN_LENGTH;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email")
        String email,
        @NotBlank(message = "Password is required")
        @Size(min = PASSWORD_MIN_LENGTH, message = "Password must be at least 8 characters")
        String password,
        @NotBlank(message = "Name is required")
        @Size(max = DISPLAY_NAME_MAX_LENGTH, message = "Name is too long")
        String displayName
) {
}
