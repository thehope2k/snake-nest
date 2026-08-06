package io.snakenest.nest.chat.dto;

public record ReactionSummary(String emoji, long count, boolean reactedByMe) {
}
