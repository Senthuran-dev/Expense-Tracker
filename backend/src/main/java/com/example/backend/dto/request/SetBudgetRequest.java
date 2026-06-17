package com.example.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SetBudgetRequest {
    @NotNull
    private Long categoryId;

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotNull
    @Min(1)
    @Max(12)
    private Short month;

    @NotNull
    private Short year;
}
