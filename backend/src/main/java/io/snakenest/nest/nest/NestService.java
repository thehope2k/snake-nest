package io.snakenest.nest.nest;

import io.snakenest.nest.common.ApiException;
import io.snakenest.nest.nest.dto.CreateNestRequest;
import io.snakenest.nest.nest.dto.MemberResponse;
import io.snakenest.nest.nest.dto.NestResponse;
import io.snakenest.nest.nest.dto.RenameNestRequest;
import io.snakenest.nest.user.User;
import io.snakenest.nest.user.UserRepository;
import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NestService {

    private static final String INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int INVITE_CODE_LENGTH = 8;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final NestRepository nestRepository;
    private final NestMembershipRepository membershipRepository;
    private final UserRepository userRepository;

    @Transactional
    public NestResponse createNest(UUID ownerId, CreateNestRequest request) {
        Nest nest = new Nest(request.name(), request.icon(), ownerId, generateInviteCode());
        nestRepository.save(nest);
        membershipRepository.save(new NestMembership(nest.getId(), ownerId));
        log.info("Nest created: {} by {}", nest.getId(), ownerId);
        return toResponse(nest);
    }

    @Transactional(readOnly = true)
    public List<NestResponse> listMyNests(UUID userId) {
        List<UUID> nestIds = membershipRepository.findByUserId(userId).stream().map(NestMembership::getNestId).toList();
        return nestRepository.findByIdIn(nestIds).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public NestResponse getNest(UUID nestId, UUID requesterId) {
        requireMember(nestId, requesterId);
        return toResponse(requireNest(nestId));
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> listMembers(UUID nestId, UUID requesterId) {
        requireMember(nestId, requesterId);
        return membersOf(nestId);
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> searchUsers(UUID nestId, UUID requesterId, String query) {
        requireMember(nestId, requesterId);
        String needle = query.trim().toLowerCase();
        return userRepository.searchNotInNest(nestId, needle).stream()
                .map(user -> new MemberResponse(user.getId(), user.getDisplayName(), user.getAvatar()))
                .toList();
    }

    @Transactional
    public void addMember(UUID nestId, UUID actorId, UUID targetUserId) {
        requireMember(nestId, actorId);
        if (membershipRepository.existsByNestIdAndUserId(nestId, targetUserId)) {
            throw new ApiException(HttpStatus.CONFLICT, "Already in this Nest");
        }
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        membershipRepository.save(new NestMembership(nestId, target.getId()));
        log.info("{} added {} to Nest {}", actorId, targetUserId, nestId);
    }

    @Transactional
    public void removeMember(UUID nestId, UUID actorId, UUID targetUserId) {
        Nest nest = requireNest(nestId);
        if (!nest.getOwnerId().equals(actorId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the Nest owner can remove people");
        }
        if (nest.getOwnerId().equals(targetUserId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Can't remove the Nest owner");
        }
        membershipRepository.deleteByNestIdAndUserId(nestId, targetUserId);
        log.info("{} removed {} from Nest {}", actorId, targetUserId, nestId);
    }

    @Transactional(readOnly = true)
    public String getInviteCode(UUID nestId, UUID requesterId) {
        requireMember(nestId, requesterId);
        return requireNest(nestId).getInviteCode();
    }

    @Transactional
    public NestResponse joinByCode(UUID userId, String code) {
        Nest nest = nestRepository.findByInviteCode(code.trim().toUpperCase())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invalid invite code"));
        if (membershipRepository.existsByNestIdAndUserId(nest.getId(), userId)) {
            throw new ApiException(HttpStatus.CONFLICT, "Already in this Nest");
        }
        membershipRepository.save(new NestMembership(nest.getId(), userId));
        log.info("{} joined Nest {} via invite code", userId, nest.getId());
        return toResponse(nest);
    }

    @Transactional
    public NestResponse startConversation(UUID creatorId, List<UUID> participantIds) {
        List<UUID> others = participantIds.stream().distinct().filter(id -> !id.equals(creatorId)).toList();
        if (others.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Pick at least one other person");
        }
        List<User> found = userRepository.findAllById(others);
        if (found.size() != others.size()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "One or more people not found");
        }

        if (others.size() == 1) {
            Optional<Nest> existing = findExistingDirectMessage(creatorId, others.get(0));
            if (existing.isPresent()) {
                return toResponse(existing.get());
            }
        }

        Nest nest = new Nest(null, null, creatorId, generateInviteCode());
        nestRepository.save(nest);
        membershipRepository.save(new NestMembership(nest.getId(), creatorId));
        others.forEach(participantId -> membershipRepository.save(new NestMembership(nest.getId(), participantId)));
        log.info("Conversation started: {} by {} with {}", nest.getId(), creatorId, others);
        return toResponse(nest);
    }

    @Transactional
    public NestResponse rename(UUID nestId, UUID actorId, RenameNestRequest request) {
        requireMember(nestId, actorId);
        Nest nest = requireNest(nestId);
        nest.rename(request.name(), request.icon());
        log.info("{} renamed Nest {}", actorId, nestId);
        return toResponse(nest);
    }

    private Optional<Nest> findExistingDirectMessage(UUID userId, UUID otherUserId) {
        List<UUID> myNestIds = membershipRepository.findByUserId(userId).stream().map(NestMembership::getNestId).toList();
        for (Nest nest : nestRepository.findByIdInAndNameIsNull(myNestIds)) {
            List<UUID> memberIds = membershipRepository.findByNestId(nest.getId()).stream()
                    .map(NestMembership::getUserId)
                    .toList();
            if (memberIds.size() == 2 && memberIds.contains(otherUserId)) {
                return Optional.of(nest);
            }
        }
        return Optional.empty();
    }

    private String generateInviteCode() {
        StringBuilder code = new StringBuilder(INVITE_CODE_LENGTH);
        for (int i = 0; i < INVITE_CODE_LENGTH; i++) {
            code.append(INVITE_CODE_ALPHABET.charAt(RANDOM.nextInt(INVITE_CODE_ALPHABET.length())));
        }
        return code.toString();
    }

    private List<MemberResponse> membersOf(UUID nestId) {
        List<UUID> memberIds = membershipRepository.findByNestId(nestId).stream().map(NestMembership::getUserId).toList();
        return userRepository.findAllById(memberIds).stream()
                .map(user -> new MemberResponse(user.getId(), user.getDisplayName(), user.getAvatar()))
                .toList();
    }

    private void requireMember(UUID nestId, UUID userId) {
        if (!membershipRepository.existsByNestIdAndUserId(nestId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You're not a member of this Nest");
        }
    }

    private Nest requireNest(UUID nestId) {
        return nestRepository.findById(nestId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Nest not found"));
    }

    private NestResponse toResponse(Nest nest) {
        List<UUID> memberIds = membershipRepository.findByNestId(nest.getId()).stream().map(NestMembership::getUserId).toList();
        return new NestResponse(nest.getId(), nest.getName(), nest.getIcon(), nest.getOwnerId(), memberIds);
    }
}
