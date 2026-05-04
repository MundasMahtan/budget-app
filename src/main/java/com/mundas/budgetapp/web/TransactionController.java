package com.mundas.budgetapp.web;

import com.mundas.budgetapp.service.TransactionService;
import com.mundas.budgetapp.web.dto.TransactionRequest;
import com.mundas.budgetapp.web.dto.TransactionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionResponse> create(@RequestBody @Valid TransactionRequest req) {
        TransactionResponse created = transactionService.createTransaction(req);
        // Build the Location header: takes the current request URL and appends the new id.
        // e.g. POST /api/v1/transactions → Location: /api/v1/transactions/42
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping
    public List<TransactionResponse> getByMonth(@RequestParam int year,
                                                @RequestParam int month) {
        return transactionService.getTransactionsForMonth(year, month);
    }

    @GetMapping("/{id}")
    public TransactionResponse getById(@PathVariable Long id) {
        return transactionService.getTransaction(id);
    }

    @PutMapping("/{id}")
    public TransactionResponse update(@PathVariable Long id,
                                      @RequestBody @Valid TransactionRequest req) {
        return transactionService.updateTransaction(id, req);
    }

    // 204 No Content: the operation succeeded but there is nothing to return.
    // Standard HTTP convention for a successful DELETE.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}
