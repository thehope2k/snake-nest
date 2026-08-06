package io.snakenest.nest.nest.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateNestRequest(@NotBlank String name, @NotBlank String icon) {
}
