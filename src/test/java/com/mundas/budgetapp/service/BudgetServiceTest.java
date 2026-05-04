package com.mundas.budgetapp.service;

import com.mundas.budgetapp.domain.Category;
import com.mundas.budgetapp.domain.CategoryType;
import com.mundas.budgetapp.domain.MonthlyBudget;
import com.mundas.budgetapp.domain.Subcategory;
import com.mundas.budgetapp.exception.ResourceNotFoundException;
import com.mundas.budgetapp.repository.MonthlyBudgetRepository;
import com.mundas.budgetapp.repository.SubcategoryRepository;
import com.mundas.budgetapp.web.dto.BudgetRequest;
import com.mundas.budgetapp.web.dto.BudgetResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock MonthlyBudgetRepository monthlyBudgetRepository;
    @Mock SubcategoryRepository subcategoryRepository;
    @InjectMocks BudgetService budgetService;

    private Subcategory subcategory;

    @BeforeEach
    void setUp() {
        Category category = new Category();
        category.setId(1L);
        category.setName("ΕΣΟΔΑ");
        category.setType(CategoryType.INCOME);

        subcategory = new Subcategory();
        subcategory.setId(1L);
        subcategory.setName("Μισθός");
        subcategory.setCategory(category);
    }

    @Test
    void upsertBudget_createsNewWhenNoneExists() {
        when(subcategoryRepository.findById(1L)).thenReturn(Optional.of(subcategory));
        when(monthlyBudgetRepository.findByYearAndMonthAndSubcategoryId(2026, 5, 1L))
                .thenReturn(Optional.empty());
        when(monthlyBudgetRepository.save(any())).thenAnswer(inv -> {
            MonthlyBudget b = inv.getArgument(0);
            b.setId(1L);
            return b;
        });

        BudgetResponse response = budgetService.upsertBudget(
                2026, 5, 1L, new BudgetRequest(new BigDecimal("2000.00")));

        assertThat(response.projectedAmount()).isEqualByComparingTo("2000.00");
        assertThat(response.subcategoryName()).isEqualTo("Μισθός");
        verify(monthlyBudgetRepository).save(any());
    }

    @Test
    void upsertBudget_updatesExistingWhenFound() {
        MonthlyBudget existing = new MonthlyBudget();
        existing.setId(5L);
        existing.setYear(2026);
        existing.setMonth(5);
        existing.setSubcategory(subcategory);
        existing.setProjectedAmount(new BigDecimal("1500.00"));

        when(subcategoryRepository.findById(1L)).thenReturn(Optional.of(subcategory));
        when(monthlyBudgetRepository.findByYearAndMonthAndSubcategoryId(2026, 5, 1L))
                .thenReturn(Optional.of(existing));
        when(monthlyBudgetRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        BudgetResponse response = budgetService.upsertBudget(
                2026, 5, 1L, new BudgetRequest(new BigDecimal("2000.00")));

        // Same id — it's an update, not a new row
        assertThat(response.id()).isEqualTo(5L);
        assertThat(response.projectedAmount()).isEqualByComparingTo("2000.00");
    }

    @Test
    void upsertBudget_throwsWhenSubcategoryNotFound() {
        when(subcategoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> budgetService.upsertBudget(
                2026, 5, 99L, new BudgetRequest(new BigDecimal("100.00"))))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void fillBlanks_doesNotOverwriteExistingBudgets() {
        MonthlyBudget prevBudget = new MonthlyBudget();
        prevBudget.setSubcategory(subcategory);
        prevBudget.setProjectedAmount(new BigDecimal("2000.00"));

        MonthlyBudget existingThisMonth = new MonthlyBudget();
        existingThisMonth.setSubcategory(subcategory);
        existingThisMonth.setProjectedAmount(new BigDecimal("1800.00"));

        when(monthlyBudgetRepository.findByYearAndMonth(2026, 4)).thenReturn(List.of(prevBudget));
        // subcategoryId=1 already set for this month
        when(monthlyBudgetRepository.findByYearAndMonth(2026, 5)).thenReturn(List.of(existingThisMonth));

        budgetService.fillBlanks(2026, 5);

        // save should never be called — existing budget must not be overwritten
        verify(monthlyBudgetRepository, never()).save(any());
    }
}
