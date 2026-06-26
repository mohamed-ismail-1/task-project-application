package com.taskflow.backend.repository;

import com.taskflow.backend.entity.Task;
import com.taskflow.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUser(User user);
    
    @Query("SELECT t FROM Task t WHERE t.user = :user AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Task> searchTasks(@Param("user") User user, 
                          @Param("priority") Task.Priority priority, 
                          @Param("status") Task.Status status, 
                          @Param("search") String search);

    long countByUser(User user);
    long countByUserAndStatus(User user, Task.Status status);
    long countByUserAndPriority(User user, Task.Priority priority);
}
