package com.example.hackathon.wics.model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;


@Entity
@Table(name ="users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Users {
    @Id
    @GeneratedValue
    @Column(name="id", unique = true, nullable = false)
    private UUID id;
    @Column(name="email", unique = true, nullable = false)
    private String email;
    @Column(name="username", unique = true, nullable = false)
    private String username;
    @Column(name="password", nullable = false)
    private String password;
    @Column(name="points")
    private int points;

    public Users(String email, String username, String password, int points) {
        this.email = email;
        this.username = username;
        this.password = password;
        this.points = points;
    }
}