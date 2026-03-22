package com.example.hackathon.wics.birdPointRegistry;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Service
public class BirdPointInitService {

    private final BirdPointRegistry birdPointRegistry;

    public BirdPointInitService(BirdPointRegistry birdPointRegistry) {
        this.birdPointRegistry = birdPointRegistry;
    }

    public BirdPointDefinition getName (String name){
        return birdPointRegistry.get(name);
    }

    @Async
    @EventListener(ApplicationReadyEvent.class)
    public void init(){
        birdPointRegistry.load();
    }
}
