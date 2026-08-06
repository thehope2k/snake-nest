package io.snakenest.nest.doghouse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.livekit.server.RoomServiceClient;
import io.snakenest.nest.common.ApiException;
import io.snakenest.nest.doghouse.dto.DoghouseRejection;
import io.snakenest.nest.nest.Nest;
import io.snakenest.nest.nest.NestMembership;
import io.snakenest.nest.nest.NestMembershipRepository;
import io.snakenest.nest.nest.NestRepository;
import io.snakenest.nest.meet.MeetService;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import livekit.LivekitModels;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import retrofit2.Call;
import retrofit2.Response;

class DoghouseServiceTest {

    private static final long DURATION_SECONDS = 60;
    private static final long COOLDOWN_SECONDS = 30;
    private static final double MAX_CONCURRENT_RATIO = 0.5;

    private final UUID nestId = UUID.randomUUID();
    private final UUID actorId = UUID.randomUUID();
    private final UUID targetId = UUID.randomUUID();

    private NestRepository nestRepository;
    private NestMembershipRepository membershipRepository;
    private MeetService meetService;
    private StringRedisTemplate redisTemplate;
    private HashOperations<String, Object, Object> hashOperations;
    private ApplicationEventPublisher eventPublisher;
    private RoomServiceClient roomServiceClient;
    private DoghouseService doghouseService;

    @BeforeEach
    void setUp() {
        nestRepository = mock(NestRepository.class);
        membershipRepository = mock(NestMembershipRepository.class);
        meetService = mock(MeetService.class);
        redisTemplate = mock(StringRedisTemplate.class);
        hashOperations = mock(HashOperations.class);
        eventPublisher = mock(ApplicationEventPublisher.class);
        roomServiceClient = mock(RoomServiceClient.class);
        when(redisTemplate.opsForHash()).thenReturn(hashOperations);

        doghouseService = new DoghouseService(
                nestRepository, membershipRepository, meetService, redisTemplate, eventPublisher,
                roomServiceClient, DURATION_SECONDS, COOLDOWN_SECONDS, MAX_CONCURRENT_RATIO);

        when(membershipRepository.existsByNestIdAndUserId(nestId, actorId)).thenReturn(true);
        when(membershipRepository.existsByNestIdAndUserId(nestId, targetId)).thenReturn(true);
        when(meetService.isActiveParticipant(nestId, actorId)).thenReturn(true);
        when(meetService.isActiveParticipant(nestId, targetId)).thenReturn(true);
        when(meetService.activeParticipantCount(nestId)).thenReturn(2);
        when(hashOperations.entries(anyString())).thenReturn(Map.of());
        stubNoPublishedTracks();
    }

    @Test
    void sendRejectsNonMembers() {
        when(membershipRepository.existsByNestIdAndUserId(nestId, targetId)).thenReturn(false);

        ApiException exception = org.junit.jupiter.api.Assertions.assertThrows(
                ApiException.class, () -> doghouseService.sendToDoghouse(nestId, actorId, targetId));
        assertThat(exception.getStatus().value()).isEqualTo(403);
    }

    @Test
    void sendRejectsSendingYourself() {
        ApiException exception = org.junit.jupiter.api.Assertions.assertThrows(
                ApiException.class, () -> doghouseService.sendToDoghouse(nestId, actorId, actorId));
        assertThat(exception.getStatus().value()).isEqualTo(400);
    }

    @Test
    void sendRejectsWhenTargetIsNotOnTheCall() {
        when(meetService.isActiveParticipant(nestId, targetId)).thenReturn(false);

        ApiException exception = org.junit.jupiter.api.Assertions.assertThrows(
                ApiException.class, () -> doghouseService.sendToDoghouse(nestId, actorId, targetId));
        assertThat(exception.getStatus().value()).isEqualTo(400);
    }

    @Test
    void sendRejectsAlreadyBenched() {
        when(hashOperations.get(benchedKey(), targetId.toString()))
                .thenReturn(String.valueOf(System.currentTimeMillis() + 30_000));

        DoghouseRejection rejection = doghouseService.sendToDoghouse(nestId, actorId, targetId);

        assertThat(rejection).isEqualTo(DoghouseRejection.ALREADY_BENCHED);
    }

    @Test
    void sendRejectsOnCooldown() {
        when(hashOperations.get(cooldownKey(), targetId.toString()))
                .thenReturn(String.valueOf(System.currentTimeMillis() + 10_000));

        DoghouseRejection rejection = doghouseService.sendToDoghouse(nestId, actorId, targetId);

        assertThat(rejection).isEqualTo(DoghouseRejection.ON_COOLDOWN);
    }

    @Test
    void sendRejectsWhenNestIsFull() {
        when(meetService.activeParticipantCount(nestId)).thenReturn(4);
        long future = System.currentTimeMillis() + 30_000;
        when(hashOperations.entries(benchedKey())).thenReturn(Map.of(
                UUID.randomUUID().toString(), String.valueOf(future),
                UUID.randomUUID().toString(), String.valueOf(future)));

        DoghouseRejection rejection = doghouseService.sendToDoghouse(nestId, actorId, targetId);

        assertThat(rejection).isEqualTo(DoghouseRejection.NEST_FULL);
    }

    @Test
    void sendSucceedsAndBenchesTheTarget() {
        NestMembership membership = new NestMembership(nestId, targetId);
        when(membershipRepository.findByNestIdAndUserId(nestId, targetId)).thenReturn(Optional.of(membership));

        DoghouseRejection rejection = doghouseService.sendToDoghouse(nestId, actorId, targetId);

        assertThat(rejection).isNull();
        verify(hashOperations).put(eq(benchedKey()), eq(targetId.toString()), anyString());
        verify(membershipRepository).save(membership);
        assertThat(membership.getDoghouseSentCount()).isEqualTo(1);
        verify(eventPublisher).publishEvent(any(DoghouseBroadcastEvent.class));
    }

    @Test
    void releaseRejectsNonOwners() {
        Nest nest = nestFor(UUID.randomUUID());
        when(nestRepository.findById(nestId)).thenReturn(Optional.of(nest));

        ApiException exception = org.junit.jupiter.api.Assertions.assertThrows(
                ApiException.class, () -> doghouseService.releaseFromDoghouse(nestId, actorId, targetId));
        assertThat(exception.getStatus().value()).isEqualTo(403);
    }

    @Test
    void releaseByOwnerClearsBenchAndStartsCooldown() {
        Nest nest = nestFor(actorId);
        when(nestRepository.findById(nestId)).thenReturn(Optional.of(nest));
        when(hashOperations.delete(benchedKey(), targetId.toString())).thenReturn(1L);

        doghouseService.releaseFromDoghouse(nestId, actorId, targetId);

        verify(hashOperations).put(eq(cooldownKey()), eq(targetId.toString()), anyString());
        verify(eventPublisher).publishEvent(any(DoghouseBroadcastEvent.class));
    }

    @Test
    void releaseIsANoOpWhenTargetWasNotBenched() {
        Nest nest = nestFor(actorId);
        when(nestRepository.findById(nestId)).thenReturn(Optional.of(nest));
        when(hashOperations.delete(benchedKey(), targetId.toString())).thenReturn(0L);

        doghouseService.releaseFromDoghouse(nestId, actorId, targetId);

        verify(hashOperations, never()).put(eq(cooldownKey()), anyString(), anyString());
        verify(eventPublisher, never()).publishEvent(any(DoghouseBroadcastEvent.class));
    }

    @Test
    void sweepReleasesExpiredBenchesAndSkipsFutureOnes() {
        UUID expiredUser = UUID.randomUUID();
        UUID stillBenchedUser = UUID.randomUUID();
        when(redisTemplate.keys(anyString())).thenReturn(Set.of(benchedKey()));
        when(hashOperations.entries(benchedKey())).thenReturn(Map.of(
                expiredUser.toString(), String.valueOf(System.currentTimeMillis() - 1_000),
                stillBenchedUser.toString(), String.valueOf(System.currentTimeMillis() + 30_000)));
        when(hashOperations.delete(benchedKey(), expiredUser.toString())).thenReturn(1L);

        doghouseService.sweepExpiredBenches();

        verify(hashOperations).delete(benchedKey(), expiredUser.toString());
        verify(hashOperations, never()).delete(benchedKey(), stillBenchedUser.toString());
    }

    private void stubNoPublishedTracks() {
        Call<LivekitModels.ParticipantInfo> call = mock(Call.class);
        try {
            when(call.execute()).thenReturn(Response.success(LivekitModels.ParticipantInfo.newBuilder().build()));
        } catch (java.io.IOException impossible) {
            throw new AssertionError(impossible);
        }
        when(roomServiceClient.getParticipant(anyString(), anyString())).thenReturn(call);
    }

    private Nest nestFor(UUID ownerId) {
        return new Nest("Test Nest", "🐾", ownerId, "invite-code");
    }

    private String benchedKey() {
        return "doghouse:" + nestId + ":benched";
    }

    private String cooldownKey() {
        return "doghouse:" + nestId + ":cooldown";
    }
}
