package com.example.hackathon.wics.service;

import com.example.hackathon.wics.model.UserSession;
import com.example.hackathon.wics.model.Users;
import com.example.hackathon.wics.repository.UserSessionRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserSessionService {

    private final UserSessionRepository userSessionRepository;
    private final UserService userService;

    public UserSessionService(UserSessionRepository userSessionRepository, UserService userService ) {
        this.userSessionRepository = userSessionRepository;
        this.userService = userService;
    }

    public UserSession createSession(UUID userId) {
        userSessionRepository.findByUserId(userId)
                .ifPresent(userSessionRepository::delete);

        UserSession newSession = new UserSession(userId);
        return userSessionRepository.save(newSession);
    }

    public Users getSessionBySessionId(String session) {
      UserSession userSession = userSessionRepository.findById(session)
                .orElseThrow(() -> new RuntimeException("Session not found"));
      return userService.getUserById(userSession.getUserId());

    }

    public UserSession getSessionByUserId(UUID userId) {
        return userSessionRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Session not found for user id: " + userId));
    }

    public void deleteSession(String session) {
        UserSession existingSession = userSessionRepository.findById(session)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        userSessionRepository.delete(existingSession);
    }

    public void deleteSessionByUserId(UUID userId) {
        UserSession existingSession = userSessionRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Session not found for user id: " + userId));

        userSessionRepository.delete(existingSession);
    }

    public boolean isValidSession(String session) {
        return userSessionRepository.existsById(session);
    }
}