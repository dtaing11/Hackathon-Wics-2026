package com.example.hackathon.wics.controller;

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

    public SpeciesController(SpeciesService speciesService) {
        this.speciesService = speciesService;
    }

    @GetMapping
    public ResponseEntity<List<Species>> getAllSpecies() {
        List<Species> species = speciesService.getAllSpecies();
        return ResponseEntity.ok(species);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Species> getSpeciesById(@PathVariable UUID id) {
        Species species = speciesService.getSpeciesById(id);
        return ResponseEntity.ok(species);
    }

    @PostMapping
    public ResponseEntity<Species> createSpecies(@RequestBody Species species) {
        Species created = speciesService.createSpecies(species);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Species> updateSpecies(
            @PathVariable UUID id,
            @RequestBody Species updatedSpecies) {
        Species updated = speciesService.updateSpecies(id, updatedSpecies);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSpecies(@PathVariable UUID id) {
        speciesService.deleteSpecies(id);
        return ResponseEntity.noContent().build();
    }
}
