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
    @Column(name= "user_id", nullable = false)
    private UUID user_id;
    @Column(name = "image_url", nullable = false, unique = true)
    private String image_url;
    @Column(name = "latitude", nullable = false)
    private Double latitude;
    @Column(name= "longtitude", nullable = false)
    private Double longitude;
    @Column(name= "created_at", nullable = false)
    private LocalDateTime created_at = LocalDateTime.now();


    public Post(UUID user_id, String image_url, Double latitude, Double longitude) {
        this.user_id = user_id;
        this.image_url = image_url;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}