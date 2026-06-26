package com.taskflow.backend.service;

import com.taskflow.backend.dto.AuthRequest;
import com.taskflow.backend.dto.AuthResponse;
import com.taskflow.backend.dto.RegisterRequest;
import com.taskflow.backend.entity.User;
import com.taskflow.backend.repository.UserRepository;
import com.taskflow.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        var user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .build();
        
        userRepository.save(user);
        
        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                new java.util.ArrayList<>()
        );
        
        var jwtToken = jwtService.generateToken(userDetails);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        
        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                new java.util.ArrayList<>()
        );
        
        var jwtToken = jwtService.generateToken(userDetails);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();
    }
}
