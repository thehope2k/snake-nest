package io.snakenest.nest.config;

import io.snakenest.nest.nest.NestMembershipRepository;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NestTopicChannelInterceptor implements ChannelInterceptor {

    private static final Pattern NEST_TOPIC = Pattern.compile("^/topic/nests/([^/]+)/(chat|meet)$");

    private final NestMembershipRepository membershipRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() != StompCommand.SUBSCRIBE) return message;

        String destination = accessor.getDestination();
        Matcher matcher = destination == null ? null : NEST_TOPIC.matcher(destination);
        if (matcher == null || !matcher.matches()) return null;

        if (accessor.getUser() == null) {
            log.warn("Rejected subscription to {}: no authenticated user on the session", destination);
            return null;
        }

        UUID nestId;
        UUID userId;
        try {
            nestId = UUID.fromString(matcher.group(1));
            userId = UUID.fromString(accessor.getUser().getName());
        } catch (IllegalArgumentException exception) {
            log.warn("Rejected subscription to {}: malformed nest or user id", destination);
            return null;
        }

        if (!membershipRepository.existsByNestIdAndUserId(nestId, userId)) {
            log.warn("Rejected subscription: {} is not a member of Nest {}", userId, nestId);
            return null;
        }
        return message;
    }
}
