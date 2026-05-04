-- V1: baseline schema
-- All four tables. Flyway runs this exactly once and records it in flyway_schema_history.
-- A "good" Flyway migration is: small, named after what it does, and NEVER edited after commit.

-- SQLite type notes:
--   INTEGER PRIMARY KEY  → SQLite's native rowid alias; auto-increments without the AUTOINCREMENT keyword
--   TEXT                 → stores LocalDate as 'YYYY-MM-DD', Instant as ISO-8601, enums as their name string
--   NUMERIC              → SQLite's flexible numeric affinity; sqlite-jdbc uses setBigDecimal/getBigDecimal
--                          which round-trips through the string representation, so no float precision loss
--   INTEGER (0/1)        → SQLite has no BOOLEAN type; 0=false, 1=true; Hibernate maps this correctly

CREATE TABLE categories (
    id            INTEGER PRIMARY KEY,
    name          TEXT    NOT NULL,
    type          TEXT    NOT NULL,          -- 'INCOME' or 'EXPENSE'
    active        INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER NOT NULL
);

CREATE TABLE subcategories (
    id            INTEGER PRIMARY KEY,
    name          TEXT    NOT NULL,
    category_id   INTEGER NOT NULL REFERENCES categories(id),
    active        INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER NOT NULL
);

-- 'transaction' is a reserved SQL keyword in many databases, so we use 'transactions'
CREATE TABLE transactions (
    id             INTEGER PRIMARY KEY,
    date           TEXT    NOT NULL,          -- LocalDate: 'YYYY-MM-DD'
    amount         NUMERIC NOT NULL,          -- BigDecimal, always stored with scale=2
    description    TEXT    CHECK (length(description) <= 255),
    subcategory_id INTEGER NOT NULL REFERENCES subcategories(id),
    created_at     TEXT    NOT NULL,          -- Instant: ISO-8601 UTC
    updated_at     TEXT    NOT NULL,          -- Instant: ISO-8601 UTC
    deleted        INTEGER NOT NULL DEFAULT 0 -- soft delete flag
);

CREATE TABLE monthly_budgets (
    id               INTEGER PRIMARY KEY,
    year             INTEGER NOT NULL,
    month            INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    subcategory_id   INTEGER NOT NULL REFERENCES subcategories(id),
    projected_amount NUMERIC NOT NULL,
    UNIQUE (year, month, subcategory_id)
);
