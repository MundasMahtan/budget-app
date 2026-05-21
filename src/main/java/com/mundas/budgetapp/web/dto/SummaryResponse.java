package com.mundas.budgetapp.web.dto;

import java.math.BigDecimal;
import java.util.List;

public record SummaryResponse(
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal totalProjectedExpenses,
        BigDecimal balance,
        List<CategorySummary> categoryBreakdown
) {

    public record CategorySummary(
            Long categoryId,
            String categoryName,
            BigDecimal totalSpent,
            BigDecimal projectedTotal
    ) {}
}
