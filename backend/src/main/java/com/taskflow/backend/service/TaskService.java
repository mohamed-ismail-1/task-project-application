package com.taskflow.backend.service;

import com.taskflow.backend.dto.DashboardStats;
import com.taskflow.backend.dto.TaskRequest;
import com.taskflow.backend.dto.TaskResponse;
import com.taskflow.backend.entity.Task;
import com.taskflow.backend.entity.User;
import com.taskflow.backend.repository.TaskRepository;
import com.taskflow.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public List<TaskResponse> getAllTasks(Task.Priority priority, Task.Status status, String search) {
        User user = getCurrentUser();
        return taskRepository.searchTasks(user, priority, status, search == null ? "" : search)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        if (!task.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized access to task");
        }
        
        return mapToResponse(task);
    }

    public TaskResponse createTask(TaskRequest request) {
        User user = getCurrentUser();
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : Task.Priority.MEDIUM)
                .status(request.getStatus() != null ? request.getStatus() : Task.Status.PENDING)
                .dueDate(request.getDueDate())
                .user(user)
                .build();
        
        return mapToResponse(taskRepository.save(task));
    }

    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        if (!task.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized access to task");
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
        task.setDueDate(request.getDueDate());
        
        return mapToResponse(taskRepository.save(task));
    }

    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        if (!task.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized access to task");
        }
        
        taskRepository.delete(task);
    }

    public DashboardStats getStats() {
        User user = getCurrentUser();
        return DashboardStats.builder()
                .totalTasks(taskRepository.countByUser(user))
                .completedTasks(taskRepository.countByUserAndStatus(user, Task.Status.COMPLETED))
                .pendingTasks(taskRepository.countByUserAndStatus(user, Task.Status.PENDING))
                .highPriorityTasks(taskRepository.countByUserAndPriority(user, Task.Priority.HIGH))
                .build();
    }

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
