package com.mundas.budgetapp.repository;

import com.mundas.budgetapp.domain.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Spring Data generates: WHERE deleted = false AND date BETWEEN :start AND :end
    // ORDER BY date DESC, id DESC
    // The service layer computes start = first day of month, end = last day of month.
    // Using a date range is portable across databases; using strftime() would tie us to SQLite.
    // id DESC as secondary sort gives stable ordering when multiple transactions share a date.
    List<Transaction> findByDeletedFalseAndDateBetweenOrderByDateDescIdDesc(
            LocalDate start, LocalDate end);

    // For GET /transactions/{id}: we never expose soft-deleted rows via the API.
    Optional<Transaction> findByIdAndDeletedFalse(Long id);

    // Used by the list endpoint: JOIN FETCH subcategory so toResponse() can read
    // subcategory.name without triggering a separate SELECT per transaction (N+1).
    @Query("""
            SELECT t FROM Transaction t
            JOIN FETCH t.subcategory s
            WHERE t.deleted = false
              AND t.date BETWEEN :start AND :end
            ORDER BY t.date DESC, t.id DESC
            """)
    List<Transaction> findByMonth(@Param("start") LocalDate start,
                                  @Param("end") LocalDate end);

    // Used by the summary endpoint: also joins category so the service can read
    // subcategory.category.type (INCOME/EXPENSE) without extra lazy loads.
    @Query("""
            SELECT t FROM Transaction t
            JOIN FETCH t.subcategory s
            JOIN FETCH s.category c
            WHERE t.deleted = false
              AND t.date BETWEEN :start AND :end
            """)
    List<Transaction> findForSummary(@Param("start") LocalDate start,
                                     @Param("end") LocalDate end);
}
