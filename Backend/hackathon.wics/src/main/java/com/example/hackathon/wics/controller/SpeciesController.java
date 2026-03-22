package com.example.hackathon.wics.controller;

import com.example.hackathon.wics.birdInfoRegistry.BirdInfoDefinition;
import com.example.hackathon.wics.birdInfoRegistry.BirdInfoInitService;
import com.example.hackathon.wics.controller.dto.GetSpeciesRes;
import com.example.hackathon.wics.model.Species;
import com.example.hackathon.wics.service.SpeciesService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/species", produces = MediaType.APPLICATION_JSON_VALUE)
@CrossOrigin(origins = "*")
public class SpeciesController {

    private final SpeciesService speciesService;
    private final BirdInfoInitService birdInfoInitService;

    public SpeciesController(SpeciesService speciesService,  BirdInfoInitService birdInfoInitService) {
        this.speciesService = speciesService;
        this.birdInfoInitService = birdInfoInitService;
    }

    @GetMapping("/post/{id}")
    public ResponseEntity<GetSpeciesRes> getPostById(@PathVariable UUID id) {
       Species species =  speciesService.getSpeciesByPostId(id);
       BirdInfoDefinition birdInfoDefinition = birdInfoInitService.getName(species.getSpecies());
       GetSpeciesRes getSpeciesRes = new GetSpeciesRes(
               birdInfoDefinition.getBirdName(),
               birdInfoDefinition.getAverageWeightSpecies(),
               birdInfoDefinition.getDescription(),
               birdInfoDefinition.getGeography(),
               birdInfoDefinition.getRarity()
       );
       return ResponseEntity.ok().body(getSpeciesRes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSpecies(@PathVariable UUID id) {
        speciesService.deleteSpecies(id);
        return ResponseEntity.noContent().build();
    }
}
