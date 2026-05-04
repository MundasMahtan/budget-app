package com.mundas.budgetapp.web;

import com.mundas.budgetapp.service.SummaryService;
import com.mundas.budgetapp.web.dto.SummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/summary")
@RequiredArgsConstructor
public class SummaryController {

    private final SummaryService summaryService;

    @GetMapping
    public SummaryResponse getSummary(@RequestParam int year, @RequestParam int month) {
        return summaryService.getSummary(year, month);
    }
}
