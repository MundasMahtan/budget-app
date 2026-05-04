package com.mundas.budgetapp.service;

import com.mundas.budgetapp.domain.MonthlyBudget;
import com.mundas.budgetapp.domain.Subcategory;
import com.mundas.budgetapp.exception.ResourceNotFoundException;
import com.mundas.budgetapp.repository.MonthlyBudgetRepository;
import com.mundas.budgetapp.repository.SubcategoryRepository;
import com.mundas.budgetapp.web.dto.BudgetRequest;
import com.mundas.budgetapp.web.dto.BudgetResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.RoundingMode;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final MonthlyBudgetRepository monthlyBudgetRepository;
    private final SubcategoryRepository subcategoryRepository;

    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(int year, int month) {
        return monthlyBudgetRepository.findByYearAndMonth(year, month)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BudgetResponse upsertBudget(int year, int month, Long subcategoryId, BudgetRequest req) {
        Subcategory sub = subcategoryRepository.findById(subcategoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Subcategory not found: " + subcategoryId));

        // orElseGet(MonthlyBudget::new) means: if no row exists yet, create a fresh entity.
        // If a row exists, we update it — same method handles both create and update paths.
        MonthlyBudget budget = monthlyBudgetRepository
                .findByYearAndMonthAndSubcategoryId(year, month, subcategoryId)
                .orElseGet(MonthlyBudget::new);

        budget.setYear(year);
        budget.setMonth(month);
        budget.setSubcategory(sub);
        budget.setProjectedAmount(req.projectedAmount().setScale(2, RoundingMode.HALF_UP));

        return toResponse(monthlyBudgetRepository.save(budget));
    }

    @Transactional
    public List<BudgetResponse> fillBlanks(int year, int month) {
        int prevYear  = (month == 1) ? year - 1 : year;
        int prevMonth = (month == 1) ? 12 : month - 1;

        List<MonthlyBudget> previousBudgets =
                monthlyBudgetRepository.findByYearAndMonth(prevYear, prevMonth);

        // Which subcategories already have a budget entry for the target month?
        Set<Long> alreadySet = monthlyBudgetRepository.findByYearAndMonth(year, month)
                .stream()
                .map(b -> b.getSubcategory().getId())
                .collect(Collectors.toSet());

        // Copy from previous month only where nothing is set yet — never overwrite.
        for (MonthlyBudget prev : previousBudgets) {
            if (!alreadySet.contains(prev.getSubcategory().getId())) {
                MonthlyBudget copy = new MonthlyBudget();
                copy.setYear(year);
                copy.setMonth(month);
                copy.setSubcategory(prev.getSubcategory()); // safe: entity is already loaded
                copy.setProjectedAmount(prev.getProjectedAmount());
                monthlyBudgetRepository.save(copy);
            }
        }

        // Return the full resulting set for this month.
        return monthlyBudgetRepository.findByYearAndMonth(year, month)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private BudgetResponse toResponse(MonthlyBudget b) {
        Subcategory sub = b.getSubcategory();
        return new BudgetResponse(
                b.getId(),
                b.getYear(),
                b.getMonth(),
                sub.getId(),
                sub.getName(),
                sub.getCategory().getId(),
                sub.getCategory().getName(),
                b.getProjectedAmount().setScale(2, RoundingMode.HALF_UP)
        );
    }
}
