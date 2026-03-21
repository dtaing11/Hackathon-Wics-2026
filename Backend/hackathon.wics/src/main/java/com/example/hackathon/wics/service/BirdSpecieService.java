package com.example.hackathon.wics.service;

import com.example.hackathon.wics.model.BirdSpecie;
import com.example.hackathon.wics.repository.BirdSpecieRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BirdSpecieService {

    private final BirdSpecieRepository birdSpecieRepository;

    public BirdSpecieService(BirdSpecieRepository birdSpecieRepository) {
        this.birdSpecieRepository = birdSpecieRepository;
    }

    public BirdSpecie createBirdSpecie(BirdSpecie birdSpecie) {
        if (birdSpecieRepository.existsById(birdSpecie.getName())) {
            throw new RuntimeException("Bird specie already exists with name: " + birdSpecie.getName());
        }
        return birdSpecieRepository.save(birdSpecie);
    }

    public List<BirdSpecie> getAllBirdSpecies() {
        return birdSpecieRepository.findAll();
    }

    public BirdSpecie getBirdSpecieByName(String name) {
        return birdSpecieRepository.findById(name)
                .orElseThrow(() -> new RuntimeException("Bird specie not found with name: " + name));
    }

    public BirdSpecie updateBirdSpecie(String name, BirdSpecie updatedBirdSpecie) {
        BirdSpecie existingBirdSpecie = birdSpecieRepository.findById(name)
                .orElseThrow(() -> new RuntimeException("Bird specie not found with name: " + name));

        existingBirdSpecie.setRarity(updatedBirdSpecie.getRarity());
        existingBirdSpecie.setLocation(updatedBirdSpecie.getLocation());

        return birdSpecieRepository.save(existingBirdSpecie);
    }

    public void deleteBirdSpecie(String name) {
        BirdSpecie existingBirdSpecie = birdSpecieRepository.findById(name)
                .orElseThrow(() -> new RuntimeException("Bird specie not found with name: " + name));

        birdSpecieRepository.delete(existingBirdSpecie);
    }
}