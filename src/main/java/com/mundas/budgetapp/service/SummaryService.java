package com.mundas.budgetapp.service;

import com.mundas.budgetapp.domain.CategoryType;
import com.mundas.budgetapp.domain.Transaction;
import com.mundas.budgetapp.domain.MonthlyBudget;
import com.mundas.budgetapp.repository.CategoryRepository;
import com.mundas.budgetapp.repository.MonthlyBudgetRepository;
import com.mundas.budgetapp.repository.TransactionRepository;
import com.mundas.budgetapp.web.dto.SummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SummaryService {

    private final TransactionRepository transactionRepository;
    private final MonthlyBudgetRepository monthlyBudgetRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public SummaryResponse getSummary(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        List<Transaction> transactions = transactionRepository.findForSummary(start, end);
        List<MonthlyBudget> budgets = monthlyBudgetRepository.findByYearAndMonth(year, month);

        // Split total income vs expenses.
        // BigDecimal arithmetic uses .add() — never += or + on primitives.
        // BigDecimal is immutable: bd.add(x) returns a NEW object; the original is unchanged.
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getSubcategory().getCategory().getType() == CategoryType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalExpenses = transactions.stream()
                .filter(t -> t.getSubcategory().getCategory().getType() == CategoryType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalProjectedExpenses = budgets.stream()
                .map(MonthlyBudget::getProjectedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal balance = totalIncome.subtract(totalExpenses)
                .setScale(2, RoundingMode.HALF_UP);

        // Build a map: categoryId → total spent, for O(1) lookup below.
        Map<Long, BigDecimal> spentByCategory = transactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getSubcategory().getCategory().getId(),
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        // Build a map: subcategoryId → projected amount, for O(1) lookup below.
        Map<Long, BigDecimal> projectedBySubcategory = budgets.stream()
                .collect(Collectors.toMap(
                        b -> b.getSubcategory().getId(),
                        MonthlyBudget::getProjectedAmount
                ));

        // One entry per active category, zero-filled when no transactions or budgets exist.
        // findAllActiveWithSubcategories() returns categories that have at least one active
        // subcategory (INNER JOIN), which is correct: a category with no active subcategories
        // cannot receive transactions anyway.
        List<SummaryResponse.CategorySummary> breakdown = categoryRepository
                .findAllActiveWithSubcategories()
                .stream()
                .map(c -> {
                    BigDecimal totalSpent = spentByCategory
                            .getOrDefault(c.getId(), BigDecimal.ZERO)
                            .setScale(2, RoundingMode.HALF_UP);

                    // Sum projected amounts across all active subcategories in this category.
                    BigDecimal projectedTotal = c.getSubcategories().stream()
                            .map(s -> projectedBySubcategory.getOrDefault(s.getId(), BigDecimal.ZERO))
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                            .setScale(2, RoundingMode.HALF_UP);

                    return new SummaryResponse.CategorySummary(
                            c.getId(), c.getName(), totalSpent, projectedTotal);
                })
                .toList();

        return new SummaryResponse(totalIncome, totalExpenses, totalProjectedExpenses, balance, breakdown);
    }
}
