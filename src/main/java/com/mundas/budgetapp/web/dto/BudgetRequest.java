package com.mundas.budgetapp.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record BudgetRequest(

        @NotNull
        @Positive
        BigDecimal projectedAmount
) {}
