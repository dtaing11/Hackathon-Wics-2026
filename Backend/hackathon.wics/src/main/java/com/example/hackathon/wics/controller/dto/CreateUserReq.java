package com.example.hackathon.wics.controller.dto;

public record CreateUserReq(
         String email,
         String username,
      String password
) {
}
//
//        this.email = email;
//        this.username = username;
//        this.password = password;
//        this.points = points;
