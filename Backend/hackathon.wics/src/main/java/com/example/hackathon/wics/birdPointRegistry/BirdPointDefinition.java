package com.example.hackathon.wics.birdPointRegistry;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BirdPointDefinition {
    @JsonProperty("species")
    private String species;
    @JsonProperty("rarity_rank")
    private Integer rarityRank;
    @JsonProperty("location")
    private String location;
}
