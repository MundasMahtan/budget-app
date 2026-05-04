package com.mundas.budgetapp.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(

        @NotNull
        LocalDate date,

        // @Positive rejects zero and negative values at the HTTP boundary,
        // before the service layer is ever called.
        @NotNull
        @Positive
        BigDecimal amount,

        @Size(max = 255)
        String description,

        @NotNull
        Long subcategoryId
) {}
