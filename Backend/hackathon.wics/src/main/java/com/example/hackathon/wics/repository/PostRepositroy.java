package com.example.hackathon.wics.repository;

import com.example.hackathon.wics.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PostRepositroy extends JpaRepository<Post, UUID> {
    @Query(value = """
    SELECT DISTINCT p.*
    FROM post p
    JOIN species s ON s.post_id = p.id
    WHERE p.user_id = :userId
      AND s.species = :species
    """, nativeQuery = true)
    Optional<List<Post>> findPostsByUserIdAndSpecies(@Param("userId") UUID userId,
                                                    @Param("species") String species);

    List<Post> findByUserId(UUID userId);
}
