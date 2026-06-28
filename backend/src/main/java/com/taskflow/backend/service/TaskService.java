package com.taskflow.backend.service;

import com.taskflow.backend.dto.DashboardStats;
import com.taskflow.backend.dto.SubTaskDto;
import com.taskflow.backend.dto.TaskRequest;
import com.taskflow.backend.dto.TaskResponse;
import com.taskflow.backend.entity.SubTask;
import com.taskflow.backend.entity.Task;
import com.taskflow.backend.entity.User;
import com.taskflow.backend.repository.TaskRepository;
import com.taskflow.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
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
                .subTasks(new ArrayList<>())
                .build();
        
        if (request.getSubTasks() != null) {
            for (SubTaskDto subDto : request.getSubTasks()) {
                SubTask subTask = SubTask.builder()
                        .title(subDto.getTitle())
                        .isCompleted(subDto.isCompleted())
                        .task(task)
                        .build();
                task.getSubTasks().add(subTask);
            }
        }
        
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
        
        task.getSubTasks().clear();
        if (request.getSubTasks() != null) {
            for (SubTaskDto subDto : request.getSubTasks()) {
                SubTask subTask = SubTask.builder()
                        .title(subDto.getTitle())
                        .isCompleted(subDto.isCompleted())
                        .task(task)
                        .build();
                task.getSubTasks().add(subTask);
            }
        }
        
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
                .mediumPriorityTasks(taskRepository.countByUserAndPriority(user, Task.Priority.MEDIUM))
                .lowPriorityTasks(taskRepository.countByUserAndPriority(user, Task.Priority.LOW))
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
                .subTasks(task.getSubTasks() != null ? task.getSubTasks().stream()
                        .map(sub -> SubTaskDto.builder()
                                .id(sub.getId())
                                .title(sub.getTitle())
                                .isCompleted(sub.isCompleted())
                                .build())
                        .collect(Collectors.toList()) : new ArrayList<>())
                .build();
    }

    public byte[] generateMonthlyReport(int year, int month) {
        User user = getCurrentUser();
        LocalDateTime start = YearMonth.of(year, month).atDay(1).atStartOfDay();
        LocalDateTime end = YearMonth.of(year, month).atEndOfMonth().atTime(23, 59, 59);

        List<Task> tasks = taskRepository.findByUserAndDueDateBetween(user, start, end);
        
        StringBuilder csv = new StringBuilder();
        csv.append("Date,Title,Status,Priority,Subtasks Completed/Total\n");
        
        for (Task task : tasks) {
            String date = task.getDueDate() != null ? task.getDueDate().toLocalDate().toString() : "";
            String title = task.getTitle().replace(",", " "); // sanitize commas
            String status = task.getStatus().toString();
            String priority = task.getPriority().toString();
            
            long totalSub = task.getSubTasks() != null ? task.getSubTasks().size() : 0;
            long completedSub = task.getSubTasks() != null ? task.getSubTasks().stream().filter(SubTask::isCompleted).count() : 0;
            
            csv.append(String.format("%s,%s,%s,%s,%d/%d\n", date, title, status, priority, completedSub, totalSub));
        }
        
        return csv.toString().getBytes();
    }
}
