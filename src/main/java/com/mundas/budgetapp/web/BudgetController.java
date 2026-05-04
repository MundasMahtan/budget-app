package com.mundas.budgetapp.web;

import com.mundas.budgetapp.service.BudgetService;
import com.mundas.budgetapp.web.dto.BudgetRequest;
import com.mundas.budgetapp.web.dto.BudgetResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public List<BudgetResponse> getByMonth(@RequestParam int year, @RequestParam int month) {
        return budgetService.getBudgets(year, month);
    }

    // Year, month, and subcategoryId come from the URL path — they identify the resource.
    // The body carries only the value being set (projectedAmount).
    @PutMapping("/{year}/{month}/{subcategoryId}")
    public BudgetResponse upsert(@PathVariable int year,
                                 @PathVariable int month,
                                 @PathVariable Long subcategoryId,
                                 @RequestBody @Valid BudgetRequest req) {
        return budgetService.upsertBudget(year, month, subcategoryId, req);
    }

    @PostMapping("/{year}/{month}/fill-blanks")
    public List<BudgetResponse> fillBlanks(@PathVariable int year, @PathVariable int month) {
        return budgetService.fillBlanks(year, month);
    }
}
