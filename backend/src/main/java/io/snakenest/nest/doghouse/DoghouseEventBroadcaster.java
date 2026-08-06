package io.snakenest.nest.doghouse;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DoghouseEventBroadcaster {

    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void onDoghouseBroadcastEvent(DoghouseBroadcastEvent event) {
        messagingTemplate.convertAndSend("/topic/nests/" + event.nestId() + "/meet", event.payload());
    }
}
