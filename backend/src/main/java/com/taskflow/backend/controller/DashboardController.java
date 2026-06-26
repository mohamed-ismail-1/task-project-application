package com.taskflow.backend.controller;

import com.taskflow.backend.dto.DashboardStats;
import com.taskflow.backend.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(
origins = "https://task-project-application-1.onrender.com"
)
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final TaskService taskService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        return ResponseEntity.ok(taskService.getStats());
    }
}
