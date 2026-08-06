package io.snakenest.nest.config;

import io.livekit.server.RoomServiceClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LiveKitConfig {

    @Bean
    public RoomServiceClient roomServiceClient(
            @Value("${nest.livekit.url}") String livekitUrl,
            @Value("${nest.livekit.api-key}") String livekitApiKey,
            @Value("${nest.livekit.api-secret}") String livekitApiSecret) {
        // RoomServiceClient talks to LiveKit's HTTP twirp API, not the ws(s):// URL clients
        // use to join a room -- same host, different scheme.
        String host = livekitUrl.replaceFirst("^ws", "http");
        return RoomServiceClient.createClient(host, livekitApiKey, livekitApiSecret);
    }
}
