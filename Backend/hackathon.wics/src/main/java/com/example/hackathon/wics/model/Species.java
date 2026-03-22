package com.example.hackathon.wics.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "species")
@Getter
@Setter
@NoArgsConstructor

public class Species {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, unique = true)
    private UUID id;
    @Column(name="species", nullable = false)
    private String species;
    @Column (name="confidence", nullable = false)
    private Double confidence = 0.0;
    @Column(name = "post_id")
    private UUID postId;

    public Species(String species, Double confidence,  UUID post_id) {
        this.species = species;
        this.confidence = confidence;
        this.postId = post_id;
    }
}