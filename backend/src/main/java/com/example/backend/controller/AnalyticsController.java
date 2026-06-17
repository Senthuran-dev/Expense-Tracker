package com.example.backend.controller;

import com.example.backend.dto.response.CategoryBreakdownDTO;
import com.example.backend.dto.response.DailyTrendDTO;
import com.example.backend.dto.response.MonthlyTrendDTO;
import com.example.backend.dto.response.YearlySummaryDTO;
import com.example.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/category-breakdown")
    public ResponseEntity<List<CategoryBreakdownDTO>> getCategoryBreakdown(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Short month,
            @RequestParam Short year) {
        return ResponseEntity.ok(analyticsService.getCategoryBreakdown(userDetails.getUsername(), month, year));
    }

    @GetMapping("/monthly-trend")
    public ResponseEntity<List<MonthlyTrendDTO>> getMonthlyTrend(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Short year) {
        return ResponseEntity.ok(analyticsService.getMonthlyTrend(userDetails.getUsername(), year));
    }

    @GetMapping("/daily")
    public ResponseEntity<List<DailyTrendDTO>> getDailyTrend(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Short month,
            @RequestParam Short year) {
        return ResponseEntity.ok(analyticsService.getDailyTrend(userDetails.getUsername(), month, year));
    }

    @GetMapping("/yearly-summary")
    public ResponseEntity<YearlySummaryDTO> getYearlySummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(analyticsService.getYearlySummary(userDetails.getUsername()));
    }
}
