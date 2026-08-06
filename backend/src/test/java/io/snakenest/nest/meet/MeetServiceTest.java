package io.snakenest.nest.meet;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.snakenest.nest.common.ApiException;
import io.snakenest.nest.meet.dto.JoinMeetResponse;
import io.snakenest.nest.meet.dto.MeetEvent;
import io.snakenest.nest.meet.dto.ParticipantResponse;
import io.snakenest.nest.nest.NestMembershipRepository;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;

class MeetServiceTest {

    private static final String LIVEKIT_URL = "ws://localhost:7880";
    private static final String LIVEKIT_API_KEY = "devkey";
    private static final String LIVEKIT_API_SECRET = "01234567890123456789012345678901";

    private final UUID nestId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();

    private NestMembershipRepository membershipRepository;
    private StringRedisTemplate redisTemplate;
    private HashOperations<String, Object, Object> hashOperations;
    private ApplicationEventPublisher eventPublisher;
    private MeetService meetService;

    @BeforeEach
    void setUp() {
        membershipRepository = mock(NestMembershipRepository.class);
        redisTemplate = mock(StringRedisTemplate.class);
        hashOperations = mock(HashOperations.class);
        eventPublisher = mock(ApplicationEventPublisher.class);
        when(redisTemplate.opsForHash()).thenReturn(hashOperations);

        meetService = new MeetService(
                membershipRepository, redisTemplate, eventPublisher, LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    }

    @Test
    void joinRejectsNonMembers() {
        when(membershipRepository.existsByNestIdAndUserId(nestId, userId)).thenReturn(false);

        ApiException exception = org.junit.jupiter.api.Assertions.assertThrows(
                ApiException.class, () -> meetService.join(nestId, userId));
        assertThat(exception.getStatus().value()).isEqualTo(403);
        verify(hashOperations, never()).putIfAbsent(anyString(), anyString(), anyString());
    }

    @Test
    void joinRegistersPresenceAndIssuesAScopedToken() {
        when(membershipRepository.existsByNestIdAndUserId(nestId, userId)).thenReturn(true);
        when(hashOperations.putIfAbsent(anyString(), eq(userId.toString()), anyString())).thenReturn(true);
        when(hashOperations.entries(anyString())).thenReturn(Map.of(userId.toString(), "1000"));

        JoinMeetResponse response = meetService.join(nestId, userId);

        assertThat(response.livekitUrl()).isEqualTo(LIVEKIT_URL);
        assertThat(response.token()).isNotBlank();
        assertThat(response.participants()).extracting(ParticipantResponse::userId).containsExactly(userId);
        verify(eventPublisher).publishEvent(new MeetBroadcastEvent(nestId, MeetEvent.participantJoined(userId)));
    }

    @Test
    void joinDoesNotRebroadcastOnReconnect() {
        when(membershipRepository.existsByNestIdAndUserId(nestId, userId)).thenReturn(true);
        when(hashOperations.putIfAbsent(anyString(), eq(userId.toString()), anyString())).thenReturn(false);
        when(hashOperations.entries(anyString())).thenReturn(Map.of(userId.toString(), "1000"));

        meetService.join(nestId, userId);

        verify(eventPublisher, never()).publishEvent(org.mockito.ArgumentMatchers.any(MeetBroadcastEvent.class));
    }

    @Test
    void leaveBroadcastsOnlyWhenSomeoneWasActuallyPresent() {
        when(membershipRepository.existsByNestIdAndUserId(nestId, userId)).thenReturn(true);
        when(hashOperations.delete(anyString(), eq(userId.toString()))).thenReturn(0L);

        meetService.leave(nestId, userId);

        verify(eventPublisher, never()).publishEvent(org.mockito.ArgumentMatchers.any(MeetBroadcastEvent.class));
    }

    @Test
    void listParticipantsRejectsNonMembers() {
        when(membershipRepository.existsByNestIdAndUserId(nestId, userId)).thenReturn(false);

        org.junit.jupiter.api.Assertions.assertThrows(
                ApiException.class, () -> meetService.listParticipants(nestId, userId));
    }

    @Test
    void roomNameRoundTripsBackToTheNestId() {
        String roomName = MeetService.roomName(nestId);
        assertThat(MeetService.nestIdFromRoomName(roomName)).isEqualTo(nestId);
    }

    @Test
    void nestIdFromRoomNameIgnoresUnrelatedRoomNames() {
        assertThat(MeetService.nestIdFromRoomName("some-other-room")).isNull();
        assertThat(MeetService.nestIdFromRoomName(null)).isNull();
    }
}
