package com.example.hackathon.wics.service;

import com.example.hackathon.wics.model.Species;
import com.example.hackathon.wics.repository.SpeciesRepository;
import jakarta.transaction.Transactional;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class SpeciesService {

    private final String url = "http://127.0.0.1:8000/predict";
    private final SpeciesRepository speciesRepository;
    private final RestTemplate restTemplate;

    public SpeciesService(SpeciesRepository speciesRepository,  RestTemplate restTemplate) {
        this.speciesRepository = speciesRepository;
        this.restTemplate = restTemplate;
    }



    @Async
    @Transactional
    public void createSpeciesAsync( MultipartFile file, UUID postID) {
        try {
            Map<String, Double> prediction = predictBird(file);
            Map.Entry<String, Double> entry = prediction.entrySet().iterator().next();

            String speciesName = entry.getKey();
            Double confidence = entry.getValue();

            Species species = new Species( speciesName, confidence, postID);
            speciesRepository.save(species);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<Species> getAllSpecies() {
        return speciesRepository.findAll();
    }

    public Species getSpeciesById(UUID id) {
        return speciesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Species not found with id: " + id));
    }

    public Species updateSpecies(UUID id, Species updatedSpecies) {
        Species existingSpecies = speciesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Species not found with id: " + id));

        existingSpecies.setSpecies(updatedSpecies.getSpecies());
        existingSpecies.setPostId(updatedSpecies.getPostId());

        return speciesRepository.save(existingSpecies);
    }

    public void deleteSpecies(UUID id) {
        Species existingSpecies = speciesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Species not found with id: " + id));

        speciesRepository.delete(existingSpecies);
    }

    private Map<String, Double> predictBird(MultipartFile file) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileResource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity =
                new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                Map.class
        );

        Map<String, Object> result = response.getBody();
        if (result == null) {
            return Map.of("Unknown", 0.0);
        }

        String species = String.valueOf(result.get("species"));
        Object confidenceObj = result.get("confidence");

        double confidence = 0.0;
        if (confidenceObj instanceof Number number) {
            confidence = number.doubleValue();
        } else if (confidenceObj != null) {
            confidence = Double.parseDouble(confidenceObj.toString());
        }

        double roundedConfidence = confidence;

        return Map.of(species, roundedConfidence);
    }
}