package com.example.hackathon.wics.service;

import com.example.hackathon.wics.model.Post;
import com.example.hackathon.wics.repository.PostRepositroy;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import java.util.List;
import java.util.UUID;

@Service
public class PostService {
    private final GCSService gcsService;
    private final PostRepositroy postRepositroy;

    public PostService(GCSService gcsService, PostRepositroy postRepositroy) {
        this.gcsService = gcsService;
        this.postRepositroy = postRepositroy;
    }

    @Transactional
    public Post createPost(UUID userId, double latitude, double longitude, MultipartFile file) throws IOException {
        String objectName = gcsService.uploadFile(file);

        Post post = new Post(
                userId,
                objectName,
                file.getContentType(),
                latitude,
                longitude
        );

        return postRepositroy.save(post);
    }

    public Post getPostById(UUID postId) {
        return postRepositroy.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found with id: " + postId));
    }

    public List<Post> getAllPosts() {
        return postRepositroy.findAll();
    }

    public List<Post> getPostsByUserId(UUID userId) {
        return postRepositroy.findByUserId(userId);
    }

    @Transactional
    public Post updatePost(UUID postId, Double latitude, Double longitude) {
        Post post = postRepositroy.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found with id: " + postId));

        if (latitude != null) {
            post.setLatitude(latitude);
        }

        if (longitude != null) {
            post.setLongitude(longitude);
        }

        return postRepositroy.save(post);
    }

    @Transactional
    public Post updatePostImage(UUID postId, MultipartFile file) throws IOException {
        Post post = postRepositroy.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found with id: " + postId));

        String oldObjectName = post.getImageUrl();

        String newObjectName = gcsService.uploadFile(file);

        post.setImageUrl(newObjectName);
        post.setContentType(file.getContentType());

        Post updatedPost = postRepositroy.save(post);

        if (oldObjectName != null && !oldObjectName.isBlank()) {
            gcsService.deleteFile(oldObjectName);
        }

        return updatedPost;
    }

    @Transactional
    public void deletePost(UUID postId) {
        Post post = postRepositroy.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found with id: " + postId));

        String objectName = post.getImageUrl();

        postRepositroy.delete(post);

        if (objectName != null && !objectName.isBlank()) {
            gcsService.deleteFile(objectName);
        }
    }
}
