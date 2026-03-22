package com.example.hackathon.wics.model;


import com.example.hackathon.wics.utility.GenerateSession;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "user_session")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserSession {
    @Id
    @Column(name = "session",nullable = false, unique = true)
    private String session;
    @Column(name= "user_id", nullable = false)
    private UUID userId;

    public UserSession( UUID userId) {
        this.session = GenerateSession.getGenerateSession();
        this.userId = userId;
    }


}
