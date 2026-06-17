package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class MonthlyTrendDTO {
    private Short month;
    private Short year;
    private BigDecimal total;
}
