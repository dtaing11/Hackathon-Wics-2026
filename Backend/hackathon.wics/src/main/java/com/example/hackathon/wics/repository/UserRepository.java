package com.example.hackathon.wics.repository;

import com.example.hackathon.wics.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<Users, UUID> {
    Optional<Users> findByEmail(String email);
    Optional<Users> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    Optional<Users> getUserByUsername(String username);
}