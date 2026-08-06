package io.snakenest.nest.doghouse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.snakenest.nest.doghouse.dto.DoghouseRejection;
import io.snakenest.nest.doghouse.dto.DoghouseStateResponse;
import io.snakenest.nest.doghouse.dto.SendToDoghouseResponse;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

class DoghouseControllerTest {

    private final UUID nestId = UUID.randomUUID();
    private final UUID actorId = UUID.randomUUID();
    private final UUID targetId = UUID.randomUUID();
    private final DoghouseService doghouseService = mock(DoghouseService.class);
    private final DoghouseController controller = new DoghouseController(doghouseService);

    @Test
    void sendReturnsSuccessWhenServiceAllowsIt() {
        Authentication auth = authenticationFor(actorId);
        when(doghouseService.sendToDoghouse(nestId, actorId, targetId)).thenReturn(null);

        ResponseEntity<SendToDoghouseResponse> response = controller.send(nestId, targetId, auth);

        assertThat(response.getBody()).isEqualTo(SendToDoghouseResponse.success());
    }

    @Test
    void sendReturnsTheRejectionReasonWhenTheServiceRejectsIt() {
        Authentication auth = authenticationFor(actorId);
        when(doghouseService.sendToDoghouse(nestId, actorId, targetId)).thenReturn(DoghouseRejection.ON_COOLDOWN);

        ResponseEntity<SendToDoghouseResponse> response = controller.send(nestId, targetId, auth);

        assertThat(response.getBody()).isEqualTo(SendToDoghouseResponse.rejected(DoghouseRejection.ON_COOLDOWN));
    }

    @Test
    void releaseDelegatesToServiceAndReturnsNoContent() {
        Authentication auth = authenticationFor(actorId);

        ResponseEntity<Void> response = controller.release(nestId, targetId, auth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(doghouseService).releaseFromDoghouse(nestId, actorId, targetId);
    }

    @Test
    void stateReturnsWhatTheServiceProvides() {
        Authentication auth = authenticationFor(actorId);
        List<DoghouseStateResponse> state = List.of(new DoghouseStateResponse(targetId, null, null, 2));
        when(doghouseService.currentState(nestId, actorId)).thenReturn(state);

        ResponseEntity<List<DoghouseStateResponse>> response = controller.state(nestId, auth);

        assertThat(response.getBody()).isEqualTo(state);
    }

    private Authentication authenticationFor(UUID userId) {
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(userId);
        return auth;
    }
}
