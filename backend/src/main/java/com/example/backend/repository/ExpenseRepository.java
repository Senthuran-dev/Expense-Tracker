package com.example.backend.repository;

import com.example.backend.model.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId " +
           "AND (:categoryId IS NULL OR e.category.id = :categoryId) " +
           "AND (cast(:startDate as date) IS NULL OR e.expenseDate >= :startDate) " +
           "AND (cast(:endDate as date) IS NULL OR e.expenseDate <= :endDate) " +
           "AND (:search IS NULL OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Expense> findByUserAndFilters(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId " +
           "AND (cast(:startDate as date) IS NULL OR e.expenseDate >= :startDate) " +
           "AND (cast(:endDate as date) IS NULL OR e.expenseDate <= :endDate) " +
           "ORDER BY e.expenseDate ASC")
    List<Expense> findByUserAndDateBetween(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId " +
           "AND e.category.id = :categoryId " +
           "AND EXTRACT(MONTH FROM e.expenseDate) = :month " +
           "AND EXTRACT(YEAR FROM e.expenseDate) = :year")
    BigDecimal sumByUserAndCategoryAndMonthAndYear(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("month") Short month,
            @Param("year") Short year);
            
    boolean existsByCategoryId(Long categoryId);
}
