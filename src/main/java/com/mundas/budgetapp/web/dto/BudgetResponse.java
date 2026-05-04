package com.mundas.budgetapp.web.dto;

import java.math.BigDecimal;

public record BudgetResponse(
        Long id,
        int year,
        int month,
        Long subcategoryId,
        String subcategoryName,
        Long categoryId,
        String categoryName,
        BigDecimal projectedAmount
) {}
