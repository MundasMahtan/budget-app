package com.mundas.budgetapp.service;

import com.mundas.budgetapp.domain.Category;
import com.mundas.budgetapp.domain.Subcategory;
import com.mundas.budgetapp.repository.CategoryRepository;
import com.mundas.budgetapp.web.dto.CategoryResponse;
import com.mundas.budgetapp.web.dto.SubcategoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllActiveCategories() {
        return categoryRepository.findAllActiveWithSubcategories()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private CategoryResponse toResponse(Category c) {
        List<SubcategoryResponse> subs = c.getSubcategories().stream()
                .map(this::toResponse)
                .toList();
        return new CategoryResponse(c.getId(), c.getName(), c.getType(), c.getDisplayOrder(), subs);
    }

    private SubcategoryResponse toResponse(Subcategory s) {
        return new SubcategoryResponse(s.getId(), s.getName(), s.getDisplayOrder());
    }
}
