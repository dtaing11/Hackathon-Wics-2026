package com.example.hackathon.wics.controller.dto;

import org.springframework.web.multipart.MultipartFile;

public record CreatePostReq(
        Double latitude,
        Double longtitude,
        MultipartFile file
) {
}
