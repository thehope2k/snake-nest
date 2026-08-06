package io.snakenest.nest.chat.dto;

import static io.snakenest.nest.common.ValidationLimits.REACTION_EMOJI_MAX_LENGTH;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ToggleReactionRequest(@NotBlank @Size(max = REACTION_EMOJI_MAX_LENGTH) String emoji) {
}
