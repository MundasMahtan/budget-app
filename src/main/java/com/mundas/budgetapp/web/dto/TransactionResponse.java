package com.mundas.budgetapp.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record TransactionResponse(
        Long id,
        LocalDate date,
        BigDecimal amount,
        String description,
        Long subcategoryId,
        String subcategoryName,
        Instant createdAt,
        Instant updatedAt
) {}
