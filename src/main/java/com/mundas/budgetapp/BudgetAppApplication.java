package com.mundas.budgetapp;

import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BudgetAppApplication {

    private static final Logger log = LoggerFactory.getLogger(BudgetAppApplication.class);

    public static void main(String[] args) {
        migrateDatabase();
        SpringApplication.run(BudgetAppApplication.class, args);
    }

    // Spring Boot's automatic Flyway wiring calls a method Flyway removed in v12+,
    // so we run Flyway ourselves, directly, before Spring even starts building beans.
    private static void migrateDatabase() {
        String host = System.getenv().getOrDefault("DB_HOST", "localhost");
        String port = System.getenv().getOrDefault("DB_PORT", "5432");
        String name = System.getenv().getOrDefault("DB_NAME", "budgetapp");
        String user = System.getenv().getOrDefault("DB_USER", "budgetapp");
        String password = System.getenv().getOrDefault("DB_PASSWORD", "changeme");

        String url = "jdbc:postgresql://" + host + ":" + port + "/" + name;

        log.info("Running Flyway migrations against {}", url);

        Flyway flyway = Flyway.configure()
                .dataSource(url, user, password)
                .locations("classpath:db/migration")
                .load();

        flyway.migrate();
    }
}