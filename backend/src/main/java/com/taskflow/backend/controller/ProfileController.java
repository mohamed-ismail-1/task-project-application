package com.taskflow.backend.controller;

import com.taskflow.backend.entity.User;
import com.taskflow.backend.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {
    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<User> getProfile() {
        User user = profileService.getProfile();
        user.setPassword(null); // Hide password
        return ResponseEntity.ok(user);
    }

    @PutMapping
    public ResponseEntity<User> updateProfile(@RequestBody Map<String, String> updates) {
        User user = profileService.updateProfile(updates);
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }
}
