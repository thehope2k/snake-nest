package io.snakenest.nest.nest.dto;

import static io.snakenest.nest.common.ValidationLimits.NEST_ICON_MAX_LENGTH;
import static io.snakenest.nest.common.ValidationLimits.NEST_NAME_MAX_LENGTH;

import jakarta.validation.constraints.Size;

public record RenameNestRequest(
        @Size(max = NEST_NAME_MAX_LENGTH) String name,
        @Size(max = NEST_ICON_MAX_LENGTH) String icon) {
}
