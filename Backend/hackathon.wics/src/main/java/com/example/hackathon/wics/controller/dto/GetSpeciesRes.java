package com.example.hackathon.wics.controller.dto;

public record GetSpeciesRes(
        String name,
        String species,
        String weightRange,
        String description,
        String geography,
        String rarity
) {
}
