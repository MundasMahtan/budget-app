package com.mundas.budgetapp.service;

import com.mundas.budgetapp.domain.Category;
import com.mundas.budgetapp.domain.CategoryType;
import com.mundas.budgetapp.domain.Subcategory;
import com.mundas.budgetapp.domain.Transaction;
import com.mundas.budgetapp.exception.ResourceNotFoundException;
import com.mundas.budgetapp.repository.SubcategoryRepository;
import com.mundas.budgetapp.repository.TransactionRepository;
import com.mundas.budgetapp.web.dto.TransactionRequest;
import com.mundas.budgetapp.web.dto.TransactionResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    TransactionRepository transactionRepository;
    @Mock
    SubcategoryRepository subcategoryRepository;
    @InjectMocks
    TransactionService transactionService;

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
    void createTransaction_setsCreatedAtAndUpdatedAtToSameInstant() {
        when(subcategoryRepository.findById(1L)).thenReturn(Optional.of(subcategory));
        when(transactionRepository.save(any())).thenAnswer(inv -> {
            Transaction t = inv.getArgument(0);
            t.setId(1L);
            return t;
        });

        TransactionRequest req = new TransactionRequest(
                LocalDate.of(2026, 5, 1), new BigDecimal("1800.00"), "Salary", 1L);

        TransactionResponse response = transactionService.createTransaction(req);

        assertThat(response.createdAt()).isEqualTo(response.updatedAt());
        assertThat(response.amount()).isEqualByComparingTo("1800.00");
    }

    @Test
    void updateTransaction_updatesUpdatedAtButNotCreatedAt() {
        Instant originalCreatedAt = Instant.now().minusSeconds(3600);
        Transaction existing = new Transaction();
        existing.setId(1L);
        existing.setCreatedAt(originalCreatedAt);
        existing.setUpdatedAt(originalCreatedAt);
        existing.setSubcategory(subcategory);

        when(transactionRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(existing));
        when(subcategoryRepository.findById(1L)).thenReturn(Optional.of(subcategory));
        when(transactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TransactionRequest req = new TransactionRequest(
                LocalDate.now(), new BigDecimal("900.00"), "updated", 1L);

        transactionService.updateTransaction(1L, req);

        assertThat(existing.getCreatedAt()).isEqualTo(originalCreatedAt);
        assertThat(existing.getUpdatedAt()).isAfter(originalCreatedAt);
    }

    @Test
    void deleteTransaction_setsSoftDeleteFlag() {
        Transaction existing = new Transaction();
        existing.setId(1L);
        existing.setDeleted(false);
        existing.setSubcategory(subcategory);
        existing.setUpdatedAt(Instant.now().minusSeconds(60));

        when(transactionRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(existing));

        transactionService.deleteTransaction(1L);

        assertThat(existing.isDeleted()).isTrue();
        // Verify we did NOT call deleteById — this must be a soft delete only
        verify(transactionRepository, never()).deleteById(any());
    }

    @Test
    void getTransaction_throwsResourceNotFoundWhenMissing() {
        when(transactionRepository.findByIdAndDeletedFalse(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.getTransaction(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }
}
