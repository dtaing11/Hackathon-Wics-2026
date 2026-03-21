package com.example.hackathon.wics.repository;

import com.example.hackathon.wics.model.Species;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SpeciesRepository extends JpaRepository<Species, UUID> {
}
