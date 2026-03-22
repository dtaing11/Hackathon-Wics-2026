package com.example.hackathon.wics.service;

import com.example.hackathon.wics.exeception.ResourceNotFoundException;
import com.example.hackathon.wics.model.Users;
import com.example.hackathon.wics.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Users createUser(Users user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }


    @Transactional
    public Users verifyUser(String username, String password) {
       Users user = userRepository.getUserByUsername(username).orElseThrow(()-> new ResourceNotFoundException("Failed to Verify User"));
       if (!passwordEncoder.matches(password, user.getPassword())) {
           throw new RuntimeException("Username or password is incorrect");
       }
       return user;
    }

    public List<Users> getAllUsers() {
        return userRepository.findAll();
    }

    public Users getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public Users updateUser(UUID id, Users updatedUser) {
        Users existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (!existingUser.getEmail().equals(updatedUser.getEmail())
                && userRepository.existsByEmail(updatedUser.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (!existingUser.getUsername().equals(updatedUser.getUsername())
                && userRepository.existsByUsername(updatedUser.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setPoints(updatedUser.getPoints());

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        return userRepository.save(existingUser);
    }

    public void deleteUser(UUID id) {
        Users existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        userRepository.delete(existingUser);
    }
}