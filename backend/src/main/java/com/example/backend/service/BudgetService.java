package com.example.backend.service;

import com.example.backend.dto.request.SetBudgetRequest;
import com.example.backend.model.Budget;
import com.example.backend.model.Category;
import com.example.backend.model.User;
import com.example.backend.repository.BudgetRepository;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<Budget> getBudgets(String email, Short month, Short year) {
        User user = getUser(email);
        return budgetRepository.findByUserIdAndMonthAndYear(user.getId(), month, year);
    }

    public Budget upsertBudget(String email, SetBudgetRequest request) {
        User user = getUser(email);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        if (category.getUser() != null && !category.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Category does not belong to you");
        }

        return budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(user.getId(), category.getId(), request.getMonth(), request.getYear())
                .map(existingBudget -> {
                    existingBudget.setAmount(request.getAmount());
                    return budgetRepository.save(existingBudget);
                })
                .orElseGet(() -> {
                    Budget newBudget = Budget.builder()
                            .user(user)
                            .category(category)
                            .amount(request.getAmount())
                            .month(request.getMonth())
                            .year(request.getYear())
                            .build();
                    return budgetRepository.save(newBudget);
                });
    }

    public void deleteBudget(String email, Long id) {
        Budget budget = budgetRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Budget not found"));
        if (!budget.getUser().getEmail().equals(email)) {
            throw new IllegalArgumentException("Not allowed to delete this budget");
        }
        budgetRepository.delete(budget);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
