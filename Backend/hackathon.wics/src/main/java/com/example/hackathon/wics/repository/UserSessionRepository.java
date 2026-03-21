package com.example.hackathon.wics.repository;

import com.example.hackathon.wics.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserSessionRepository extends JpaRepository<UserSession, String> {
    Optional<UserSession> findByUserId(UUID userId);
}
