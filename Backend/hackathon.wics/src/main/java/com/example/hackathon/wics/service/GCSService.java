package com.example.hackathon.wics.service;

import com.example.hackathon.wics.config.GCSConfig;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class GCSService {
    private final Storage storage;
    private final GCSConfig gcsConfig;

    public GCSService(Storage storage, GCSConfig gcsConfig) {
        this.storage = storage;
        this.gcsConfig = gcsConfig;
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String objectName = gcsConfig.getSubDirectory() + "/" + file.getOriginalFilename();

        storage.create(
                BlobInfo.newBuilder(gcsConfig.getBucketName(), objectName).build(),
                file.getBytes()
        );

        return objectName;
    }

    public void deleteFile(String objectName) {
        BlobId blobId = BlobId.of(gcsConfig.getBucketName(), objectName);
        storage.delete(blobId);
    }

    public boolean exists(String objectName) {
        return storage.get(gcsConfig.getBucketName(), objectName) != null;
    }
}