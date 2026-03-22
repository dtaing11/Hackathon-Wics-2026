package com.example.hackathon.wics.controller.dto;

import java.util.UUID;

public record PostRes(
        UUID postId,
        String imageUrl,
        String contentType,
        Double latitude,
        Double longitude
) {
}
