package com.mundas.budgetapp.repository;

import com.mundas.budgetapp.domain.MonthlyBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MonthlyBudgetRepository extends JpaRepository<MonthlyBudget, Long> {

    // Returns all budget rows for a given month, with subcategory and category
    // joined eagerly so callers don't trigger lazy loads.
    @Query("""
            SELECT b FROM MonthlyBudget b
            JOIN FETCH b.subcategory s
            JOIN FETCH s.category c
            WHERE b.year = :year AND b.month = :month
            """)
    List<MonthlyBudget> findByYearAndMonth(@Param("year") int year,
                                           @Param("month") int month);

    // Used by PUT /budgets/{year}/{month}/{subcategoryId} to check whether a row
    // already exists (upsert logic lives in the service).
    Optional<MonthlyBudget> findByYearAndMonthAndSubcategoryId(int year, int month,
                                                                Long subcategoryId);
}
