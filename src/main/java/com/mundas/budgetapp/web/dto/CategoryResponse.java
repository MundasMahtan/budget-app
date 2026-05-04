package com.mundas.budgetapp.web.dto;

import com.mundas.budgetapp.domain.CategoryType;

import java.util.List;

public record CategoryResponse(
        Long id,
        String name,
        CategoryType type,
        int displayOrder,
        List<SubcategoryResponse> subcategories
) {}
