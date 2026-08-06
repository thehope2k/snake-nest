package io.snakenest.nest.meet;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MeetEventBroadcaster {

    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void onMeetBroadcastEvent(MeetBroadcastEvent event) {
        messagingTemplate.convertAndSend("/topic/nests/" + event.nestId() + "/meet", event.payload());
    }
}
