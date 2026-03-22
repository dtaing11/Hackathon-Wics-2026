package com.example.hackathon.wics.birdInfoRegistry;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BirdInfoDefinition {
    @JsonProperty("bird_name")
    private String birdName;

    @JsonProperty("species_name")
    private String speciesName;

    @JsonProperty("rarity")
    private String rarity;

    @JsonProperty("description")
    private String description;

    @JsonProperty("average_weight_species")
    private String averageWeightSpecies;

    @JsonProperty("geography")
    private String geography;
}
