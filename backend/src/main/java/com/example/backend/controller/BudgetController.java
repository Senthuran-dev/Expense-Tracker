package com.example.backend.controller;

import com.example.backend.dto.response.BudgetResponse;
import com.example.backend.dto.request.SetBudgetRequest;
import com.example.backend.model.Budget;
import com.example.backend.service.AnalyticsService;
import com.example.backend.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getBudgets(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Short month,
            @RequestParam Short year) {
        List<BudgetResponse> responses = budgetService.getBudgets(userDetails.getUsername(), month, year)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> upsertBudget(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SetBudgetRequest request) {
        Budget budget = budgetService.upsertBudget(userDetails.getUsername(), request);
        return ResponseEntity.ok(mapToResponse(budget));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        budgetService.deleteBudget(userDetails.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getBudgetSummary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Short month,
            @RequestParam Short year) {
        return ResponseEntity.ok(analyticsService.getBudgetVsActual(userDetails.getUsername(), month, year));
    }

    private BudgetResponse mapToResponse(Budget budget) {
        return BudgetResponse.builder()
                .id(budget.getId())
                .category(budget.getCategory())
                .amount(budget.getAmount())
                .month(budget.getMonth())
                .year(budget.getYear())
                .build();
    }
}
