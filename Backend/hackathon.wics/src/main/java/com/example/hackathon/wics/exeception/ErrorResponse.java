package com.example.hackathon.wics.exeception;

import java.time.Instant;

public record ErrorResponse(
    Instant timestamp,
    int status,
    String errorMsg ) 
{}
