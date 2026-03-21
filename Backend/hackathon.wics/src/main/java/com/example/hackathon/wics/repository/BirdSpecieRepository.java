package com.example.hackathon.wics.repository;

import com.example.hackathon.wics.model.BirdSpecie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BirdSpecieRepository extends JpaRepository<BirdSpecie, String> {
}