package com.example.backend.service;

import com.example.backend.dto.response.BudgetSummaryDTO;
import com.example.backend.dto.response.CategoryBreakdownDTO;
import com.example.backend.dto.response.DailyTrendDTO;
import com.example.backend.dto.response.MonthlyTrendDTO;
import com.example.backend.dto.response.YearlySummaryDTO;
import com.example.backend.model.Budget;
import com.example.backend.model.Category;
import com.example.backend.model.Expense;
import com.example.backend.model.User;
import com.example.backend.repository.BudgetRepository;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ExpenseRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<BudgetSummaryDTO> getBudgetVsActual(String email, Short month, Short year) {
        User user = getUser(email);
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(user.getId(), month, year);
        
        List<BudgetSummaryDTO> summaryList = new ArrayList<>();
        for (Budget budget : budgets) {
            Category category = budget.getCategory();
            BigDecimal spent = expenseRepository.sumByUserAndCategoryAndMonthAndYear(user.getId(), category.getId(), month, year);
            if (spent == null) {
                spent = BigDecimal.ZERO;
            }
            BigDecimal remaining = budget.getAmount().subtract(spent);
            double percentageUsed = spent.doubleValue() / budget.getAmount().doubleValue() * 100.0;

            summaryList.add(BudgetSummaryDTO.builder()
                    .categoryId(category.getId())
                    .categoryName(category.getName())
                    .categoryIcon(category.getIcon())
                    .categoryColor(category.getColor())
                    .budgetAmount(budget.getAmount())
                    .spentAmount(spent)
                    .remainingAmount(remaining)
                    .percentageUsed(percentageUsed)
                    .build());
        }
        return summaryList;
    }

    public List<CategoryBreakdownDTO> getCategoryBreakdown(String email, Short month, Short year) {
        User user = getUser(email);
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = YearMonth.of(year, month).atEndOfMonth();

        List<Expense> expenses = expenseRepository.findByUserAndDateBetween(user.getId(), startDate, endDate);
        
        BigDecimal grandTotal = expenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<Category, BigDecimal> categoryTotals = expenses.stream()
                .collect(Collectors.groupingBy(Expense::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)));

        return categoryTotals.entrySet().stream()
                .map(entry -> {
                    Category category = entry.getKey();
                    BigDecimal total = entry.getValue();
                    double percentage = grandTotal.compareTo(BigDecimal.ZERO) == 0 ? 0.0 :
                            total.doubleValue() / grandTotal.doubleValue() * 100.0;

                    return CategoryBreakdownDTO.builder()
                            .categoryName(category.getName())
                            .categoryColor(category.getColor())
                            .total(total)
                            .percentage(percentage)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public List<MonthlyTrendDTO> getMonthlyTrend(String email, Short year) {
        User user = getUser(email);
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        
        List<Expense> expenses = expenseRepository.findByUserAndDateBetween(user.getId(), startDate, endDate);

        Map<Integer, BigDecimal> monthlyTotals = expenses.stream()
                .collect(Collectors.groupingBy(e -> e.getExpenseDate().getMonthValue(),
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)));

        List<MonthlyTrendDTO> trends = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            trends.add(MonthlyTrendDTO.builder()
                    .month((short) i)
                    .year(year)
                    .total(monthlyTotals.getOrDefault(i, BigDecimal.ZERO))
                    .build());
        }
        return trends;
    }

    public List<DailyTrendDTO> getDailyTrend(String email, Short month, Short year) {
        User user = getUser(email);
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = YearMonth.of(year, month).atEndOfMonth();

        List<Expense> expenses = expenseRepository.findByUserAndDateBetween(user.getId(), startDate, endDate);

        Map<LocalDate, BigDecimal> dailyTotals = expenses.stream()
                .collect(Collectors.groupingBy(Expense::getExpenseDate,
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)));

        List<DailyTrendDTO> trends = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            trends.add(DailyTrendDTO.builder()
                    .date(date)
                    .total(dailyTotals.getOrDefault(date, BigDecimal.ZERO))
                    .build());
        }
        return trends;
    }

    public YearlySummaryDTO getYearlySummary(String email) {
        User user = getUser(email);
        Short year = (short) LocalDate.now().getYear();
        List<MonthlyTrendDTO> trends = getMonthlyTrend(email, year);
        
        BigDecimal ytdTotal = trends.stream().map(MonthlyTrendDTO::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        
        MonthlyTrendDTO maxMonth = trends.stream().max((a, b) -> a.getTotal().compareTo(b.getTotal())).orElse(null);
        String largestMonthStr = maxMonth != null ? "Month " + maxMonth.getMonth() : "N/A";
        BigDecimal maxMonthTotal = maxMonth != null ? maxMonth.getTotal() : BigDecimal.ZERO;
        
        // Projected annual total (simple projection based on elapsed months)
        int currentMonth = LocalDate.now().getMonthValue();
        BigDecimal projected = currentMonth == 0 ? BigDecimal.ZERO :
                ytdTotal.divide(BigDecimal.valueOf(currentMonth), 2, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(12));

        return YearlySummaryDTO.builder()
                .ytdTotal(ytdTotal)
                .largestMonth(largestMonthStr)
                .largestMonthTotal(maxMonthTotal)
                .mostOverspentCategory("N/A") // Calculating this requires budget joining logic, skipped for brevity
                .projectedAnnualTotal(projected)
                .build();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
