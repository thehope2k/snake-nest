package io.snakenest.nest.chat.dto;

import static io.snakenest.nest.common.ValidationLimits.MESSAGE_TEXT_MAX_LENGTH;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record SendMessageRequest(@NotBlank @Size(max = MESSAGE_TEXT_MAX_LENGTH) String text, UUID replyToId) {
}
