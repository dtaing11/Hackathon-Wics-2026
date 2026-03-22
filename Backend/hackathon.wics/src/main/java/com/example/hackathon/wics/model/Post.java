package  com.example.hackathon.wics.model;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "post")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    @GeneratedValue
    @Column(name="id", nullable = false, unique = true, updatable = false)
    private UUID id;
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    @Column(name="content_type", nullable = false)
    private String contentType;
    @Column(name = "image_url", nullable = false, unique = true)
    private String imageUrl;
    @Column(name = "latitude", nullable = false)
    private Double latitude;
    @Column(name = "longitude", nullable = false)
    private Double longitude;
    @Column(name= "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();


    public Post(UUID user_id, String image_url, String contentType,Double latitude, Double longitude) {
        this.userId = user_id;
        this.imageUrl = image_url;
        this.latitude = latitude;
        this.longitude = longitude;
        this.contentType = contentType;
    }
}