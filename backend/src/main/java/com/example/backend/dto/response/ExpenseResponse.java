package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class ExpenseResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private BigDecimal amount;
    private String description;
    private LocalDate expenseDate;
    private String receiptUrl;
}
