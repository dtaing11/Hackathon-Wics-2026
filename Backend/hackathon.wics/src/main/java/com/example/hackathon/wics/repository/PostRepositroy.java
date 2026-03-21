package com.example.hackathon.wics.repository;

import com.example.hackathon.wics.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PostRepositroy extends JpaRepository<Post, UUID> {
    List<Post> findByUserId(UUID userId);
}