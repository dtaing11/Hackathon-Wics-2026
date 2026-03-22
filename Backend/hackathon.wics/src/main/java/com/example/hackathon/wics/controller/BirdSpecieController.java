package com.example.hackathon.wics.controller;

import com.example.hackathon.wics.model.BirdSpecie;
import com.example.hackathon.wics.service.BirdSpecieService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/api/birds", produces = MediaType.APPLICATION_JSON_VALUE)
@CrossOrigin(origins = "*")
public class BirdSpecieController {

    private final BirdSpecieService birdSpecieService;

    public BirdSpecieController(BirdSpecieService birdSpecieService) {
        this.birdSpecieService = birdSpecieService;
    }

    @GetMapping
    public ResponseEntity<List<BirdSpecie>> getAllBirdSpecies() {
        List<BirdSpecie> species = birdSpecieService.getAllBirdSpecies();
        return ResponseEntity.ok(species);
    }

    @GetMapping("/{name}")
    public ResponseEntity<BirdSpecie> getBirdSpecieByName(@PathVariable String name) {
        BirdSpecie specie = birdSpecieService.getBirdSpecieByName(name);
        return ResponseEntity.ok(specie);
    }

    @PostMapping
    public ResponseEntity<BirdSpecie> createBirdSpecie(@RequestBody BirdSpecie birdSpecie) {
        BirdSpecie created = birdSpecieService.createBirdSpecie(birdSpecie);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{name}")
    public ResponseEntity<BirdSpecie> updateBirdSpecie(
            @PathVariable String name,
            @RequestBody BirdSpecie updatedBirdSpecie) {
        BirdSpecie updated = birdSpecieService.updateBirdSpecie(name, updatedBirdSpecie);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{name}")
    public ResponseEntity<Void> deleteBirdSpecie(@PathVariable String name) {
        birdSpecieService.deleteBirdSpecie(name);
        return ResponseEntity.noContent().build();
    }
}
