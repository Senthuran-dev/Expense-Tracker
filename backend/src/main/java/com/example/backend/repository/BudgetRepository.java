package com.example.backend.repository;

import com.example.backend.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserIdAndMonthAndYear(Long userId, Short month, Short year);
    Optional<Budget> findByUserIdAndCategoryIdAndMonthAndYear(Long userId, Long categoryId, Short month, Short year);
}
