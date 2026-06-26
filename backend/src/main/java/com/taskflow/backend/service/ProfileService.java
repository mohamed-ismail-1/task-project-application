package com.taskflow.backend.service;

import com.taskflow.backend.entity.User;
import com.taskflow.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User getProfile() {
        return getCurrentUser();
    }

    public User updateProfile(Map<String, String> updates) {
        User user = getCurrentUser();
        
        if (updates.containsKey("fullName")) {
            user.setFullName(updates.get("fullName"));
        }
        
        if (updates.containsKey("password") && !updates.get("password").isBlank()) {
            user.setPassword(passwordEncoder.encode(updates.get("password")));
        }
        
        return userRepository.save(user);
    }

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
