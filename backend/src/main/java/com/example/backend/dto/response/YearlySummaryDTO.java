package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class YearlySummaryDTO {
    private BigDecimal ytdTotal;
    private String largestMonth;
    private BigDecimal largestMonthTotal;
    private String mostOverspentCategory;
    private BigDecimal projectedAnnualTotal;
}
