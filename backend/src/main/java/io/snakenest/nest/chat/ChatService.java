package io.snakenest.nest.chat;

import io.snakenest.nest.chat.dto.ChatEvent;
import io.snakenest.nest.chat.dto.MessageResponse;
import io.snakenest.nest.chat.dto.ReactionSummary;
import io.snakenest.nest.chat.dto.SendMessageRequest;
import io.snakenest.nest.common.ApiException;
import io.snakenest.nest.nest.NestMembershipRepository;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Limit;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private static final int DEFAULT_PAGE_SIZE = 50;
    private static final int MAX_PAGE_SIZE = 200;

    private final MessageRepository messageRepository;
    private final MessageReactionRepository reactionRepository;
    private final NestMembershipRepository membershipRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<MessageResponse> listMessages(UUID nestId, UUID requesterId, Instant before, Integer limit) {
        requireMember(nestId, requesterId);
        int pageSize = Math.min(limit == null ? DEFAULT_PAGE_SIZE : limit, MAX_PAGE_SIZE);
        List<Message> messages = before == null
                ? messageRepository.findByNestIdOrderByCreatedAtDesc(nestId, Limit.of(pageSize))
                : messageRepository.findByNestIdAndCreatedAtLessThanOrderByCreatedAtDesc(nestId, before, Limit.of(pageSize));

        Map<UUID, List<MessageReaction>> reactionsByMessage = reactionsFor(messages);
        return messages.stream()
                .sorted(Comparator.comparing(Message::getCreatedAt))
                .map(message -> toResponse(message, reactionsByMessage.getOrDefault(message.getId(), List.of()), requesterId))
                .toList();
    }

    @Transactional
    public MessageResponse sendMessage(UUID nestId, UUID authorId, SendMessageRequest request) {
        requireMember(nestId, authorId);
        if (request.replyToId() != null) {
            Message replyTarget = messageRepository.findById(request.replyToId())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Replying to a message that doesn't exist"));
            if (!replyTarget.getNestId().equals(nestId)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Can't reply to a message from another Nest");
            }
        }

        Message message = new Message(nestId, authorId, request.text(), request.replyToId());
        messageRepository.save(message);
        log.info("Message sent in Nest {} by {}", nestId, authorId);

        MessageResponse response = toResponse(message, List.of(), authorId);
        broadcast(nestId, ChatEvent.messageCreated(response));
        return response;
    }

    @Transactional
    public MessageResponse toggleReaction(UUID messageId, UUID requesterId, String emoji) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Message not found"));
        requireMember(message.getNestId(), requesterId);

        reactionRepository.findByMessageIdAndUserIdAndEmoji(messageId, requesterId, emoji)
                .ifPresentOrElse(
                        existing -> reactionRepository.deleteByMessageIdAndUserIdAndEmoji(messageId, requesterId, emoji),
                        () -> reactionRepository.save(new MessageReaction(messageId, requesterId, emoji)));

        List<MessageReaction> reactions = reactionRepository.findByMessageIdIn(List.of(messageId));
        MessageResponse response = toResponse(message, reactions, requesterId);
        broadcast(message.getNestId(), ChatEvent.reactionUpdated(response));
        return response;
    }

    private void broadcast(UUID nestId, ChatEvent event) {
        messagingTemplate.convertAndSend("/topic/nests/" + nestId + "/chat", event);
    }

    private Map<UUID, List<MessageReaction>> reactionsFor(List<Message> messages) {
        List<UUID> messageIds = messages.stream().map(Message::getId).toList();
        return reactionRepository.findByMessageIdIn(messageIds).stream()
                .collect(Collectors.groupingBy(MessageReaction::getMessageId));
    }

    private MessageResponse toResponse(Message message, List<MessageReaction> reactions, UUID requesterId) {
        List<ReactionSummary> summaries = reactions.stream()
                .collect(Collectors.groupingBy(MessageReaction::getEmoji))
                .entrySet()
                .stream()
                .map(entry -> new ReactionSummary(
                        entry.getKey(),
                        entry.getValue().size(),
                        entry.getValue().stream().anyMatch(r -> r.getUserId().equals(requesterId))))
                .toList();
        return new MessageResponse(
                message.getId(),
                message.getNestId(),
                message.getAuthorId(),
                message.getText(),
                message.getReplyToId(),
                message.getCreatedAt(),
                summaries);
    }

    private void requireMember(UUID nestId, UUID userId) {
        if (!membershipRepository.existsByNestIdAndUserId(nestId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You're not a member of this Nest");
        }
    }
}
