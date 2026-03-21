package com.example.hackathon.wics.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "bird_specie")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BirdSpecie {

    @Id
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "rarity", nullable = false)
    private Integer rarity;

    @Column(name = "location", nullable = false)
    private String location;
}