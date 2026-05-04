package com.mundas.budgetapp.repository;

import com.mundas.budgetapp.domain.Category;
import com.mundas.budgetapp.domain.CategoryType;
import com.mundas.budgetapp.domain.Subcategory;
import com.mundas.budgetapp.domain.Transaction;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

// @DataJpaTest loads only the JPA slice (entities, repositories, Flyway).
// replace = NONE means "use the datasource from application.yml" (our in-memory SQLite),
// instead of Spring's default behaviour of swapping in H2.
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class TransactionRepositoryTest {

    @Autowired TransactionRepository transactionRepository;
    @Autowired CategoryRepository categoryRepository;
    @Autowired SubcategoryRepository subcategoryRepository;
    @Autowired TestEntityManager em;

    private Subcategory subcategory;

    @BeforeEach
    void setUp() {
        Category category = new Category();
        category.setName("ΤΕΣΤ");
        category.setType(CategoryType.EXPENSE);
        category.setDisplayOrder(999);
        em.persist(category);

        subcategory = new Subcategory();
        subcategory.setName("Τεστ");
        subcategory.setCategory(category);
        subcategory.setDisplayOrder(10);
        em.persist(subcategory);

        em.flush();
    }

    private Transaction save(LocalDate date, BigDecimal amount, boolean deleted) {
        Transaction t = new Transaction();
        t.setDate(date);
        t.setAmount(amount);
        t.setSubcategory(subcategory);
        t.setDeleted(deleted);
        Instant now = Instant.now();
        t.setCreatedAt(now);
        t.setUpdatedAt(now);
        return transactionRepository.save(t);
    }

    @Test
    void findByMonth_returnsOnlyNonDeletedInRange() {
        save(LocalDate.of(2026, 5, 1), new BigDecimal("100.00"), false);
        save(LocalDate.of(2026, 5, 15), new BigDecimal("200.00"), false);
        save(LocalDate.of(2026, 5, 20), new BigDecimal("50.00"), true);   // deleted
        save(LocalDate.of(2026, 4, 30), new BigDecimal("300.00"), false);  // wrong month

        List<Transaction> result = transactionRepository.findByMonth(
                LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 31));

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(t -> !t.isDeleted());
    }

    @Test
    void findByMonth_returnsNewestFirst() {
        save(LocalDate.of(2026, 5, 1), new BigDecimal("100.00"), false);
        save(LocalDate.of(2026, 5, 20), new BigDecimal("200.00"), false);

        List<Transaction> result = transactionRepository.findByMonth(
                LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 31));

        assertThat(result.get(0).getDate()).isEqualTo(LocalDate.of(2026, 5, 20));
    }

    @Test
    void findByIdAndDeletedFalse_returnsEmptyForSoftDeletedRow() {
        Transaction t = save(LocalDate.of(2026, 5, 1), new BigDecimal("100.00"), true);

        assertThat(transactionRepository.findByIdAndDeletedFalse(t.getId())).isEmpty();
    }
}
