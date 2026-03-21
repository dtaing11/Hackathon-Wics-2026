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
@AllArgsConstructor

public class Species {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, unique = true)
    private UUID id;
    @Column(name="species", nullable = false)
    private String species;
    @Column(name="post_id",nullable = false)
    private UUID postId;

    public Species(String species, UUID post_id) {
        this.species = species;
        this.postId = post_id;
        this.postId = post_id;
    }
}