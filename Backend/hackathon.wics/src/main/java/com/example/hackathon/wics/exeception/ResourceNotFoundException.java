package com.example.hackathon.wics.exeception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException (String msg){
        super(msg);
    }
    
}
