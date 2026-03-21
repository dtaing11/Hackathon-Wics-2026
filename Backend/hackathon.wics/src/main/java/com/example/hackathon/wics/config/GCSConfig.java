package com.example.hackathon.wics.config;


import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@Data
@ConfigurationProperties(prefix = "gcs")
public class GCSConfig {
    private String bucketName;
    private String subDirectory;
}
