package com.example.backend.dto.response;

import com.example.backend.model.Category;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class BudgetResponse {
    private Long id;
    private Category category;
    private BigDecimal amount;
    private Short month;
    private Short year;
}
