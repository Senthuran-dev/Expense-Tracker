package com.example.backend.controller;

import com.example.backend.dto.request.CreateExpenseRequest;
import com.example.backend.dto.response.ExpenseResponse;
import com.example.backend.service.ExpenseService;
import com.lowagie.text.DocumentException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<Page<ExpenseResponse>> getExpenses(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(expenseService.getExpenses(userDetails.getUsername(), categoryId, startDate, endDate, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getExpense(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(expenseService.getExpenseById(userDetails.getUsername(), id));
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateExpenseRequest request) {
        return ResponseEntity.ok(expenseService.createExpense(userDetails.getUsername(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody CreateExpenseRequest request) {
        return ResponseEntity.ok(expenseService.updateExpense(userDetails.getUsername(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        expenseService.deleteExpense(userDetails.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        byte[] csvBytes = expenseService.exportToCsv(userDetails.getUsername(), startDate, endDate);
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=expenses.csv");
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        return ResponseEntity.ok().headers(headers).body(csvBytes);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) throws DocumentException {
        byte[] pdfBytes = expenseService.exportToPdf(userDetails.getUsername(), startDate, endDate);
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=expenses.pdf");
        headers.setContentType(MediaType.APPLICATION_PDF);
        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}
