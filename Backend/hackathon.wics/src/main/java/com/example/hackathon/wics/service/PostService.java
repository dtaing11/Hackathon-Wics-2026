package com.example.hackathon.wics.service;


import com.example.hackathon.wics.model.Post;
import com.example.hackathon.wics.repository.PostRepositroy;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PostService {

    private final PostRepositroy postRepository;

    public PostService(PostRepositroy postRepository) {
        this.postRepository = postRepository;
    }

    public Post createPost(Post post) {
        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public Post getPostById(UUID id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
    }

    public List<Post> getPostsByUserId(UUID userId) {
        return postRepository.findByUserId(userId);
    }

    public Post updatePost(UUID id, Post updatedPost) {
        Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));

        existingPost.setImageUrl(updatedPost.getImageUrl());
        existingPost.setLatitude(updatedPost.getLatitude());
        existingPost.setLongitude(updatedPost.getLongitude());

        return postRepository.save(existingPost);
    }

    public void deletePost(UUID id) {
        Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));

        postRepository.delete(existingPost);
    }
}
