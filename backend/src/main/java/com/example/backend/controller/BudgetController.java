package com.example.backend.controller;

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

@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<List<Budget>> getBudgets(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Short month,
            @RequestParam Short year) {
        return ResponseEntity.ok(budgetService.getBudgets(userDetails.getUsername(), month, year));
    }

    @PostMapping
    public ResponseEntity<Budget> upsertBudget(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SetBudgetRequest request) {
        return ResponseEntity.ok(budgetService.upsertBudget(userDetails.getUsername(), request));
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
}
