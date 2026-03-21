package com.example.hackathon.wics.service;

import com.example.hackathon.wics.model.Species;
import com.example.hackathon.wics.repository.SpeciesRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class SpeciesService {

    private final SpeciesRepository speciesRepository;

    public SpeciesService(SpeciesRepository speciesRepository) {
        this.speciesRepository = speciesRepository;
    }

    public Species createSpecies(Species species) {
        return speciesRepository.save(species);
    }

    public List<Species> getAllSpecies() {
        return speciesRepository.findAll();
    }

    public Species getSpeciesById(UUID id) {
        return speciesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Species not found with id: " + id));
    }

    public Species updateSpecies(UUID id, Species updatedSpecies) {
        Species existingSpecies = speciesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Species not found with id: " + id));

        existingSpecies.setSpecies(updatedSpecies.getSpecies());
        existingSpecies.setPostId(updatedSpecies.getPostId());

        return speciesRepository.save(existingSpecies);
    }

    public void deleteSpecies(UUID id) {
        Species existingSpecies = speciesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Species not found with id: " + id));

        speciesRepository.delete(existingSpecies);
    }
}