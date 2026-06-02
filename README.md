# budget-app

A personal expense and budget tracking web app, replacing a Greek-language Excel
spreadsheet for monthly category-level tracking. Single user, self-hosted.

## Stack

- Java 17, Spring Boot 3.5, Spring Data JPA
- SQLite via `org.xerial:sqlite-jdbc` with the community Hibernate dialect
- Flyway for schema migrations
- Maven build, JUnit 5 + AssertJ for tests
- Vanilla JS frontend (no framework), served by Spring Boot from `src/main/resources/static/`

## Running locally

Requires Java 17 and Maven 3.9+ on the PATH.

```sh
mvn clean install
java -jar target/budget-app-0.0.1-SNAPSHOT.jar
```

The app starts on `http://localhost:8080/`. The SQLite database file
(`budget.db`) is created in the current working directory on first run.

## Status

Stage 1 (backend + frontend, local-only) complete. Stage 2 (deployment to a
home server with Tailscale-based remote access) in progress.
