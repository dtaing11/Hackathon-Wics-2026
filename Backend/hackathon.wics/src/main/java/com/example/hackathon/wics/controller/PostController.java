package com.example.hackathon.wics.controller;

import com.example.hackathon.wics.controller.dto.CreatePostReq;
import com.example.hackathon.wics.controller.dto.PostRes;
import com.example.hackathon.wics.model.Post;
import com.example.hackathon.wics.model.Users;
import com.example.hackathon.wics.service.GCSService;
import com.example.hackathon.wics.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/posts", produces = MediaType.APPLICATION_JSON_VALUE)
@CrossOrigin(origins = "*")
public class PostController {

    private final PostService postService;
    private final GCSService gcsService;

    public PostController(PostService postService, GCSService gcsService) {
        this.gcsService = gcsService;
        this.postService = postService;
    }
    //public api
    @GetMapping
    public ResponseEntity<List<PostRes>> getAllPosts() {
        List<Post> posts = postService.getAllPosts();
        List<PostRes> listPostRes = new ArrayList<>();
        for(Post post : posts) {
            PostRes postRes = new PostRes(
                    post.getId(),
                    gcsService.generateSignedUrl(post.getImageUrl()),
                    post.getContentType(),
                    post.getLatitude(),
                    post.getLongitude()
            );
            listPostRes.add(postRes);

        }
        return ResponseEntity.ok(listPostRes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostRes> getPostById(@PathVariable UUID id) {
        Post post = postService.getPostById(id);
        PostRes postRes = new PostRes(
                post.getId(),
                gcsService.generateSignedUrl(post.getImageUrl()),
                post.getContentType(),
                post.getLatitude(),
                post.getLongitude()
        );
        return ResponseEntity.ok(postRes);
    }
//    UUID postId,
//    String imageUrl,
//    String contentType,
//    Double latitude,
//    Double longitude
    @GetMapping("/user/me")
    public ResponseEntity<List<PostRes>> getPostsByUserId(@AuthenticationPrincipal Users user) {
        List<Post> posts = postService.getPostsByUserId(user.getId());
        List<PostRes> listPostRes = new ArrayList<>();
        for(Post post : posts) {
            PostRes postRes = new PostRes(
                    post.getId(),
                    gcsService.generateSignedUrl(post.getImageUrl()),
                    post.getContentType(),
                    post.getLatitude(),
                    post.getLongitude()
            );
            listPostRes.add(postRes);
        }
        return ResponseEntity.ok().body(listPostRes);
    }

    @GetMapping("/posts/species/{species}")
    public ResponseEntity<List<PostRes>> getPostsByUserIdAndSpecies(@PathVariable String species, @AuthenticationPrincipal Users user) {
        List<Post> posts = postService.getPostsBySpeciesAndUserId(species, user.getId());
        List<PostRes> listPostRes = new ArrayList<>();
        for(Post post : posts) {
            PostRes postRes = new PostRes(
                    post.getId(),
                    gcsService.generateSignedUrl(post.getImageUrl()),
                    post.getContentType(),
                    post.getLatitude(),
                    post.getLongitude()
            );
            listPostRes.add(postRes);
        }
       return new ResponseEntity<>(listPostRes,  HttpStatus.OK);
    }
    @PostMapping
    public ResponseEntity<PostRes> createPost(
            @AuthenticationPrincipal Users user,
            @ModelAttribute CreatePostReq createPostReq
    ) {
        Post post;
        try {
            post = postService.createPost(
                    user.getId(),
                    createPostReq.latitude(),
                    createPostReq.longtitude(),
                    createPostReq.file()
            );
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        PostRes postRes = new PostRes(
                post.getId(),
                gcsService.generateSignedUrl(post.getImageUrl()),
                post.getContentType(),
                post.getLatitude(),
                post.getLongitude()
        );
        String signedUrl = gcsService.generateSignedUrl(post.getImageUrl());
        System.out.println("RAW KEY: " + post.getImageUrl());
        System.out.println("SIGNED URL: " + signedUrl);

        return ResponseEntity.status(HttpStatus.CREATED).body(postRes);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable UUID id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
}

