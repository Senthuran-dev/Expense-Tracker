package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class DailyTrendDTO {
    private LocalDate date;
    private BigDecimal total;
}
