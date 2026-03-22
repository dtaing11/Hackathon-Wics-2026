package com.example.hackathon.wics.birdPointRegistry;


import com.example.hackathon.wics.birdInfoRegistry.BirdInfoDefinition;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
public class BirdPointRegistry {
    private final Map<String, BirdPointDefinition> birdPoints = new ConcurrentHashMap<>();
    private final AtomicBoolean loaded = new AtomicBoolean(false);

    public void load(){
        try{
            ObjectMapper mapper = new ObjectMapper();
            InputStream is = BirdPointRegistry.class.getClassLoader().getResourceAsStream("bird_louisiana.json");
            if(is == null){
                throw new RuntimeException("bird_louisiana.json not found");
            }

            BirdPointDefinition [] birdPoint = mapper.readValue(is,BirdPointDefinition[].class);

            for(BirdPointDefinition def : birdPoint){
                birdPoints.put(def.getSpecies(), def);
            }

            loaded.set(true);
            System.out.println("Loaded " + birdPoints.size() + " birds");
        }
        catch (Exception e){
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }
    public BirdPointDefinition get(String birdName){
        return birdPoints.get(birdName);
    }
    public Collection<BirdPointDefinition> getAll(){
        return Collections.unmodifiableCollection(birdPoints.values());
    }
    public boolean isLoaded(){
        return loaded.get();
    }

}
