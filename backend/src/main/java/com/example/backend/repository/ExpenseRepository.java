package com.example.backend.repository;

import com.example.backend.model.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long>, JpaSpecificationExecutor<Expense> {

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId " +
           "AND (:categoryId IS NULL OR e.category.id = :categoryId) " +
           "AND (:startDate IS NULL OR e.expenseDate >= :startDate) " +
           "AND (:endDate IS NULL OR e.expenseDate <= :endDate) " +
           "AND (:search IS NULL OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Expense> findByUserAndFilters(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId " +
           "AND e.expenseDate >= :startDate " +
           "AND e.expenseDate <= :endDate " +
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

    interface CategoryBreakdownProjection {
        String getName();
        String getColor();
        BigDecimal getTotal();
        Long getCount();
    }

    interface MonthlyTrendProjection {
        Integer getMonth();
        BigDecimal getTotal();
    }

    @Query("SELECT c.name as name, c.color as color, SUM(e.amount) AS total, COUNT(e) AS count "
           + "FROM Expense e JOIN e.category c "
           + "WHERE e.user.id = :userId "
           + "AND EXTRACT(MONTH FROM e.expenseDate) = :month "
           + "AND EXTRACT(YEAR FROM e.expenseDate) = :year "
           + "GROUP BY c.id, c.name, c.color "
           + "ORDER BY total DESC")
    List<CategoryBreakdownProjection> getCategoryBreakdown(
            @Param("userId") Long userId, 
            @Param("month") Short month, 
            @Param("year") Short year);

    @Query("SELECT EXTRACT(MONTH FROM e.expenseDate) AS month, SUM(e.amount) AS total "
           + "FROM Expense e "
           + "WHERE e.user.id = :userId "
           + "AND EXTRACT(YEAR FROM e.expenseDate) = :year "
           + "GROUP BY EXTRACT(MONTH FROM e.expenseDate) "
           + "ORDER BY month ASC")
    List<MonthlyTrendProjection> getMonthlyTrend(
            @Param("userId") Long userId, 
            @Param("year") Short year);
}
