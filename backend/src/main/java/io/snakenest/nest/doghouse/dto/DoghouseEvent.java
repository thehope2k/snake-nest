package io.snakenest.nest.doghouse.dto;

import java.util.UUID;

public record DoghouseEvent(String type, UUID targetUserId, Long until) {

    public static DoghouseEvent started(UUID targetUserId, long benchedUntil) {
        return new DoghouseEvent("doghouse-started", targetUserId, benchedUntil);
    }

    public static DoghouseEvent released(UUID targetUserId, long cooldownUntil) {
        return new DoghouseEvent("doghouse-released", targetUserId, cooldownUntil);
    }
}
