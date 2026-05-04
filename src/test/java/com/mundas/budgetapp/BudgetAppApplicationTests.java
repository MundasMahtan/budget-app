package com.mundas.budgetapp;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class BudgetAppApplicationTests {

    @Test
    void contextLoads() {
        // Verifies Spring context starts, Flyway migrations run, and Hibernate
        // connects to SQLite without errors. If this test fails, something is
        // wrong with config before we've written a single controller.
    }
}
