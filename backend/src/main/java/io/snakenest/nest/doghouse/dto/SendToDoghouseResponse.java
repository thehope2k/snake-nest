package io.snakenest.nest.doghouse.dto;

/** Null {@code rejection} means the send succeeded. */
public record SendToDoghouseResponse(DoghouseRejection rejection) {

    public static SendToDoghouseResponse success() {
        return new SendToDoghouseResponse(null);
    }

    public static SendToDoghouseResponse rejected(DoghouseRejection rejection) {
        return new SendToDoghouseResponse(rejection);
    }
}
