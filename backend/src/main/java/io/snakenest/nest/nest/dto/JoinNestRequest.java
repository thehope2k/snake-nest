package io.snakenest.nest.nest.dto;

import jakarta.validation.constraints.NotBlank;

public record JoinNestRequest(@NotBlank String code) {
}
