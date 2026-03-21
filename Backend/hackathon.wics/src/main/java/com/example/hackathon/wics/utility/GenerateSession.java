package com.example.hackathon.wics.utility;

import java.util.UUID;

public class GenerateSession {

    public static String getGenerateSession(){
        UUID uuid = UUID.randomUUID();
        return uuid.toString().replace("-", "");
    }
}
