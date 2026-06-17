package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class BudgetSummaryDTO {
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private BigDecimal budgetAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private Double percentageUsed;
}
