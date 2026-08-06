package io.snakenest.nest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NestBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(NestBackendApplication.class, args);
	}

}
