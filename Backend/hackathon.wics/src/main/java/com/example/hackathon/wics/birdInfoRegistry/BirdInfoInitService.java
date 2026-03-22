package com.example.hackathon.wics.birdInfoRegistry;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class BirdInfoInitService {
    private final BirdInfoRegistry birdInfoRegistry;

    public BirdInfoInitService(BirdInfoRegistry birdInfoRegistry) {
        this.birdInfoRegistry = birdInfoRegistry;
    }

    @Async
    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        birdInfoRegistry.load();
    }
}