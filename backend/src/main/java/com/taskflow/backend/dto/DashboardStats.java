package com.taskflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStats {
    private long totalTasks;
    private long completedTasks;
    private long pendingTasks;
    private long highPriorityTasks;
}
