package com.example.hackathon.wics.repository;

import com.example.hackathon.wics.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PostRepositroy extends JpaRepository<Post, UUID> {
}
