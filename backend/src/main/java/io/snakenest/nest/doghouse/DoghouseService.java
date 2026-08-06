package io.snakenest.nest.doghouse;

import io.livekit.server.RoomServiceClient;
import io.snakenest.nest.common.ApiException;
import io.snakenest.nest.doghouse.dto.DoghouseEvent;
import io.snakenest.nest.doghouse.dto.DoghouseRejection;
import io.snakenest.nest.doghouse.dto.DoghouseStateResponse;
import io.snakenest.nest.meet.MeetService;
import io.snakenest.nest.nest.Nest;
import io.snakenest.nest.nest.NestMembershipRepository;
import io.snakenest.nest.nest.NestRepository;
import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import livekit.LivekitModels;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import retrofit2.Response;

/**
 * Server-owned Doghouse state machine -- see backend/AGENTS.md's "The Doghouse state
 * machine" section. Deliberately no per-user opt-out (dropped from scope; see
 * docs/product/principles.md): everyone on a call is equally subject to it, the
 * Nest owner's early release is the only way out before the timer expires.
 */
@Slf4j
@Service
public class DoghouseService {

    private static final String KEY_PREFIX = "doghouse:";
    private static final String BENCHED_SUFFIX = ":benched";
    private static final String COOLDOWN_SUFFIX = ":cooldown";

    private final NestRepository nestRepository;
    private final NestMembershipRepository membershipRepository;
    private final MeetService meetService;
    private final StringRedisTemplate redisTemplate;
    private final ApplicationEventPublisher eventPublisher;
    private final RoomServiceClient roomServiceClient;
    private final long durationMillis;
    private final long cooldownMillis;
    private final double maxConcurrentRatio;

    public DoghouseService(
            NestRepository nestRepository,
            NestMembershipRepository membershipRepository,
            MeetService meetService,
            StringRedisTemplate redisTemplate,
            ApplicationEventPublisher eventPublisher,
            RoomServiceClient roomServiceClient,
            @Value("${nest.doghouse.duration-seconds}") long durationSeconds,
            @Value("${nest.doghouse.cooldown-seconds}") long cooldownSeconds,
            @Value("${nest.doghouse.max-concurrent-ratio}") double maxConcurrentRatio) {
        this.nestRepository = nestRepository;
        this.membershipRepository = membershipRepository;
        this.meetService = meetService;
        this.redisTemplate = redisTemplate;
        this.eventPublisher = eventPublisher;
        this.roomServiceClient = roomServiceClient;
        this.durationMillis = Duration.ofSeconds(durationSeconds).toMillis();
        this.cooldownMillis = Duration.ofSeconds(cooldownSeconds).toMillis();
        this.maxConcurrentRatio = maxConcurrentRatio;
    }

    @Transactional
    public DoghouseRejection sendToDoghouse(UUID nestId, UUID actorId, UUID targetId) {
        requireMember(nestId, actorId);
        requireMember(nestId, targetId);
        if (actorId.equals(targetId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Can't send yourself to the Doghouse");
        }
        if (!meetService.isActiveParticipant(nestId, actorId) || !meetService.isActiveParticipant(nestId, targetId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Both of you need to be on the call");
        }

        long now = System.currentTimeMillis();
        if (benchedUntil(nestId, targetId).filter(until -> until > now).isPresent()) {
            return DoghouseRejection.ALREADY_BENCHED;
        }
        if (cooldownUntil(nestId, targetId).filter(until -> until > now).isPresent()) {
            return DoghouseRejection.ON_COOLDOWN;
        }

        int activeParticipants = meetService.activeParticipantCount(nestId);
        int currentlyBenched = countActive(benchedKey(nestId), now);
        if (currentlyBenched >= maxConcurrentFor(activeParticipants)) {
            return DoghouseRejection.NEST_FULL;
        }

        long until = now + durationMillis;
        redisTemplate.<String, String>opsForHash().put(benchedKey(nestId), targetId.toString(), String.valueOf(until));

        membershipRepository.findByNestIdAndUserId(nestId, targetId).ifPresent(membership -> {
            membership.incrementDoghouseSentCount();
            membershipRepository.save(membership);
        });

        muteAudio(nestId, targetId, true);
        log.info("{} sent {} to the Doghouse in Nest {}", actorId, targetId, nestId);
        broadcast(nestId, DoghouseEvent.started(targetId, until));
        return null;
    }

    public void releaseFromDoghouse(UUID nestId, UUID actorId, UUID targetId) {
        requireMember(nestId, actorId);
        Nest nest = nestRepository.findById(nestId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Nest not found"));
        if (!nest.getOwnerId().equals(actorId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the Nest owner can release someone early");
        }
        release(nestId, targetId);
    }

    @Transactional(readOnly = true)
    public List<DoghouseStateResponse> currentState(UUID nestId, UUID requesterId) {
        requireMember(nestId, requesterId);
        long now = System.currentTimeMillis();
        Map<Object, Object> benched = redisTemplate.opsForHash().entries(benchedKey(nestId));
        Map<Object, Object> cooldowns = redisTemplate.opsForHash().entries(cooldownKey(nestId));

        return membershipRepository.findByNestId(nestId).stream()
                .map(membership -> new DoghouseStateResponse(
                        membership.getUserId(),
                        epochOrNull(benched.get(membership.getUserId().toString()), now),
                        epochOrNull(cooldowns.get(membership.getUserId().toString()), now),
                        membership.getDoghouseSentCount()))
                .toList();
    }

    // Runs regardless of whether anyone is actively watching -- the countdown has to
    // resolve on the server even if every client tab is closed when it hits zero.
    @Scheduled(fixedDelay = 1_000)
    void sweepExpiredBenches() {
        long now = System.currentTimeMillis();
        Set<String> keys = redisTemplate.keys(KEY_PREFIX + "*" + BENCHED_SUFFIX);
        if (keys == null) return;
        for (String key : keys) {
            UUID nestId = nestIdFromBenchedKey(key);
            if (nestId == null) continue;
            Map<Object, Object> entries = redisTemplate.opsForHash().entries(key);
            entries.forEach((userIdRaw, untilRaw) -> {
                long until = Long.parseLong(untilRaw.toString());
                if (until <= now) {
                    release(nestId, UUID.fromString(userIdRaw.toString()));
                }
            });
        }
    }

    private void release(UUID nestId, UUID targetId) {
        Long removed = redisTemplate.opsForHash().delete(benchedKey(nestId), targetId.toString());
        if (removed == null || removed == 0) return;

        long cooldownUntil = System.currentTimeMillis() + cooldownMillis;
        redisTemplate.<String, String>opsForHash().put(cooldownKey(nestId), targetId.toString(), String.valueOf(cooldownUntil));
        muteAudio(nestId, targetId, false);
        log.info("{} released from the Doghouse in Nest {}", targetId, nestId);
        broadcast(nestId, DoghouseEvent.released(targetId, cooldownUntil));
    }

    private void muteAudio(UUID nestId, UUID userId, boolean muted) {
        String room = MeetService.roomName(nestId);
        String identity = userId.toString();
        try {
            Response<LivekitModels.ParticipantInfo> participant = roomServiceClient.getParticipant(room, identity).execute();
            if (!participant.isSuccessful() || participant.body() == null) {
                log.warn("Could not mute {} in Nest {}: participant not connected", userId, nestId);
                return;
            }
            for (LivekitModels.TrackInfo track : participant.body().getTracksList()) {
                if (track.getType() == LivekitModels.TrackType.AUDIO) {
                    roomServiceClient.mutePublishedTrack(room, identity, track.getSid(), muted).execute();
                }
            }
        } catch (IOException exception) {
            log.warn("LiveKit mute call failed for {} in Nest {}: {}", userId, nestId, exception.getMessage());
        }
    }

    private int maxConcurrentFor(int activeParticipants) {
        return Math.max(1, (int) Math.floor(activeParticipants * maxConcurrentRatio));
    }

    private int countActive(String hashKey, long now) {
        Map<Object, Object> entries = redisTemplate.opsForHash().entries(hashKey);
        return (int) entries.values().stream().filter(until -> Long.parseLong(until.toString()) > now).count();
    }

    private Optional<Long> benchedUntil(UUID nestId, UUID userId) {
        return epoch(redisTemplate.opsForHash().get(benchedKey(nestId), userId.toString()));
    }

    private Optional<Long> cooldownUntil(UUID nestId, UUID userId) {
        return epoch(redisTemplate.opsForHash().get(cooldownKey(nestId), userId.toString()));
    }

    private static Optional<Long> epoch(Object raw) {
        return raw == null ? Optional.empty() : Optional.of(Long.parseLong(raw.toString()));
    }

    private static Long epochOrNull(Object raw, long now) {
        return epoch(raw).filter(until -> until > now).orElse(null);
    }

    private void broadcast(UUID nestId, DoghouseEvent event) {
        eventPublisher.publishEvent(new DoghouseBroadcastEvent(nestId, event));
    }

    private void requireMember(UUID nestId, UUID userId) {
        if (!membershipRepository.existsByNestIdAndUserId(nestId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You're not a member of this Nest");
        }
    }

    private static String benchedKey(UUID nestId) {
        return KEY_PREFIX + nestId + BENCHED_SUFFIX;
    }

    private static String cooldownKey(UUID nestId) {
        return KEY_PREFIX + nestId + COOLDOWN_SUFFIX;
    }

    private static UUID nestIdFromBenchedKey(String key) {
        String middle = key.substring(KEY_PREFIX.length(), key.length() - BENCHED_SUFFIX.length());
        try {
            return UUID.fromString(middle);
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }
}
