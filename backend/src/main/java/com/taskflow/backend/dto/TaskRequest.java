package com.taskflow.backend.dto;

import com.taskflow.backend.entity.Task;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    private Task.Priority priority;
    private Task.Status status;
    private LocalDateTime dueDate;
    private java.util.List<SubTaskDto> subTasks;
}
