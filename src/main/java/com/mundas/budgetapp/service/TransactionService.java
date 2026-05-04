package com.mundas.budgetapp.service;

import com.mundas.budgetapp.domain.Subcategory;
import com.mundas.budgetapp.domain.Transaction;
import com.mundas.budgetapp.exception.ResourceNotFoundException;
import com.mundas.budgetapp.repository.SubcategoryRepository;
import com.mundas.budgetapp.repository.TransactionRepository;
import com.mundas.budgetapp.web.dto.TransactionRequest;
import com.mundas.budgetapp.web.dto.TransactionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final SubcategoryRepository subcategoryRepository;

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsForMonth(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return transactionRepository.findByMonth(start, end)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransaction(Long id) {
        Transaction t = transactionRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));
        return toResponse(t);
    }

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest req) {
        Subcategory sub = subcategoryRepository.findById(req.subcategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Subcategory not found: " + req.subcategoryId()));

        Transaction t = new Transaction();
        t.setDate(req.date());
        t.setAmount(req.amount().setScale(2, RoundingMode.HALF_UP));
        t.setDescription(req.description());
        t.setSubcategory(sub);
        Instant now = Instant.now();
        t.setCreatedAt(now);
        t.setUpdatedAt(now);

        return toResponse(transactionRepository.save(t));
    }

    @Transactional
    public TransactionResponse updateTransaction(Long id, TransactionRequest req) {
        Transaction t = transactionRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));

        Subcategory sub = subcategoryRepository.findById(req.subcategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Subcategory not found: " + req.subcategoryId()));

        t.setDate(req.date());
        t.setAmount(req.amount().setScale(2, RoundingMode.HALF_UP));
        t.setDescription(req.description());
        t.setSubcategory(sub);
        t.setUpdatedAt(Instant.now());
        // createdAt is intentionally not touched here. Even if we called setCreatedAt(),
        // the updatable=false on the column means Hibernate would ignore it on UPDATE.

        return toResponse(transactionRepository.save(t));
    }

    @Transactional
    public void deleteTransaction(Long id) {
        Transaction t = transactionRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));
        t.setDeleted(true);
        t.setUpdatedAt(Instant.now());
        // No explicit save() call needed. Hibernate tracks changes to managed entities
        // (this is called "dirty checking"). When the transaction commits, Hibernate
        // compares the current state to a snapshot taken at load time, finds deleted=true
        // and updatedAt changed, and generates the UPDATE automatically.
    }

    private TransactionResponse toResponse(Transaction t) {
        return new TransactionResponse(
                t.getId(),
                t.getDate(),
                t.getAmount().setScale(2, RoundingMode.HALF_UP),
                t.getDescription(),
                t.getSubcategory().getId(),
                t.getSubcategory().getName(),
                t.getCreatedAt(),
                t.getUpdatedAt()
        );
    }
}
