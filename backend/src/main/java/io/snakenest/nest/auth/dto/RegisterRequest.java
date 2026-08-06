package io.snakenest.nest.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Email is required")
        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        @Email(message = "Enter a valid email")
        String email,
        String password,
        @NotBlank(message = "Name is required")
        String displayName
) {
}
