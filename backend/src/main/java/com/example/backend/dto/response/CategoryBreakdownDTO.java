package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class CategoryBreakdownDTO {
    private String categoryName;
    private String categoryColor;
    private BigDecimal total;
    private Double percentage;
}
