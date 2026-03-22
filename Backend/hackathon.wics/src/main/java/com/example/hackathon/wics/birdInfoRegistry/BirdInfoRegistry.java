package com.example.hackathon.wics.birdInfoRegistry;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
public class BirdInfoRegistry {
    private final Map<String, BirdInfoDefinition> birdInfo = new ConcurrentHashMap<>();
    private final AtomicBoolean loaded = new AtomicBoolean(false);

    public void load() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream is = BirdInfoRegistry.class
                    .getClassLoader()
                    .getResourceAsStream("bird_description.json");

            if (is == null) {
                throw new RuntimeException("bird_description.json not found");
            }

            BirdInfoDefinition[] birdInfos = mapper.readValue(is, BirdInfoDefinition[].class);

            for (BirdInfoDefinition def : birdInfos) {
                birdInfo.put(def.getBirdName(), def);
            }

            loaded.set(true);
            System.out.println("Loaded " + birdInfo.size() + " birds");
        } catch (Exception e) {
            throw new RuntimeException("Failed to load bird info", e);
        }
    }

    public BirdInfoDefinition get(String birdName) {
        return birdInfo.get(birdName);
    }

    public Collection<BirdInfoDefinition> getAll() {
        return Collections.unmodifiableCollection(birdInfo.values());
    }

    public boolean isLoaded() {
        return loaded.get();
    }
}