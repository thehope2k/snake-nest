package io.snakenest.nest.meet;

import io.livekit.server.AccessToken;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import io.snakenest.nest.common.ApiException;
import io.snakenest.nest.meet.dto.JoinMeetResponse;
import io.snakenest.nest.meet.dto.MeetEvent;
import io.snakenest.nest.meet.dto.ParticipantResponse;
import io.snakenest.nest.nest.NestMembershipRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MeetService {

    private static final Duration TOKEN_TTL = Duration.ofHours(6);
    private static final String ROOM_PREFIX = "nest-";

    private final NestMembershipRepository membershipRepository;
    private final StringRedisTemplate redisTemplate;
    private final ApplicationEventPublisher eventPublisher;
    private final String livekitUrl;
    private final String livekitApiKey;
    private final String livekitApiSecret;

    public MeetService(
            NestMembershipRepository membershipRepository,
            StringRedisTemplate redisTemplate,
            ApplicationEventPublisher eventPublisher,
            @Value("${nest.livekit.url}") String livekitUrl,
            @Value("${nest.livekit.api-key}") String livekitApiKey,
            @Value("${nest.livekit.api-secret}") String livekitApiSecret) {
        this.membershipRepository = membershipRepository;
        this.redisTemplate = redisTemplate;
        this.eventPublisher = eventPublisher;
        this.livekitUrl = livekitUrl;
        this.livekitApiKey = livekitApiKey;
        this.livekitApiSecret = livekitApiSecret;
    }

    public JoinMeetResponse join(UUID nestId, UUID userId) {
        requireMember(nestId, userId);

        boolean isNewParticipant = redisTemplate.<String, String>opsForHash()
                .putIfAbsent(presenceKey(nestId), userId.toString(), String.valueOf(Instant.now().toEpochMilli()));
        if (isNewParticipant) {
            log.info("{} joined the Meet call in Nest {}", userId, nestId);
            broadcast(nestId, MeetEvent.participantJoined(userId));
        }

        return new JoinMeetResponse(issueToken(nestId, userId), livekitUrl, listParticipantsWithoutMembershipCheck(nestId));
    }

    public void leave(UUID nestId, UUID userId) {
        requireMember(nestId, userId);

        Long removed = redisTemplate.opsForHash().delete(presenceKey(nestId), userId.toString());
        if (removed != null && removed > 0) {
            log.info("{} left the Meet call in Nest {}", userId, nestId);
            broadcast(nestId, MeetEvent.participantLeft(userId));
        }
    }

    public List<ParticipantResponse> listParticipants(UUID nestId, UUID requesterId) {
        requireMember(nestId, requesterId);
        return listParticipantsWithoutMembershipCheck(nestId);
    }

    public boolean isActiveParticipant(UUID nestId, UUID userId) {
        return Boolean.TRUE.equals(redisTemplate.opsForHash().hasKey(presenceKey(nestId), userId.toString()));
    }

    public int activeParticipantCount(UUID nestId) {
        Long size = redisTemplate.opsForHash().size(presenceKey(nestId));
        return size == null ? 0 : size.intValue();
    }

    private List<ParticipantResponse> listParticipantsWithoutMembershipCheck(UUID nestId) {
        Map<Object, Object> presence = redisTemplate.opsForHash().entries(presenceKey(nestId));
        return presence.entrySet().stream()
                .map(entry -> new ParticipantResponse(
                        UUID.fromString(entry.getKey().toString()),
                        Instant.ofEpochMilli(Long.parseLong(entry.getValue().toString()))))
                .sorted(Comparator.comparing(ParticipantResponse::joinedAt))
                .toList();
    }

    void removeParticipant(UUID nestId, UUID userId) {
        Long removed = redisTemplate.opsForHash().delete(presenceKey(nestId), userId.toString());
        if (removed != null && removed > 0) {
            log.info("{} disconnected from the Meet call in Nest {} (reconciled via LiveKit webhook)", userId, nestId);
            broadcast(nestId, MeetEvent.participantLeft(userId));
        }
    }

    void clearAllParticipants(UUID nestId) {
        List<ParticipantResponse> remaining = listParticipantsWithoutMembershipCheck(nestId);
        redisTemplate.delete(presenceKey(nestId));
        remaining.forEach(participant -> broadcast(nestId, MeetEvent.participantLeft(participant.userId())));
        if (!remaining.isEmpty()) {
            log.info("Meet call ended in Nest {} (reconciled via LiveKit webhook)", nestId);
        }
    }

    private String issueToken(UUID nestId, UUID userId) {
        AccessToken token = new AccessToken(livekitApiKey, livekitApiSecret);
        token.setIdentity(userId.toString());
        token.setTtl(TOKEN_TTL.toSeconds());
        token.addGrants(new RoomJoin(true), new RoomName(roomName(nestId)));
        return token.toJwt();
    }

    private void broadcast(UUID nestId, MeetEvent event) {
        eventPublisher.publishEvent(new MeetBroadcastEvent(nestId, event));
    }

    private void requireMember(UUID nestId, UUID userId) {
        if (!membershipRepository.existsByNestIdAndUserId(nestId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You're not a member of this Nest");
        }
    }

    public static String roomName(UUID nestId) {
        return ROOM_PREFIX + nestId;
    }

    static UUID nestIdFromRoomName(String roomName) {
        if (roomName == null || !roomName.startsWith(ROOM_PREFIX)) return null;
        try {
            return UUID.fromString(roomName.substring(ROOM_PREFIX.length()));
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private static String presenceKey(UUID nestId) {
        return "meet:" + nestId + ":participants";
    }
}
