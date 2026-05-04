package com.mundas.budgetapp.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.Instant;

// autoApply = true: Hibernate applies this converter to every Instant field in every
// entity automatically — no annotation needed on the fields themselves.
//
// Problem it solves: Hibernate 6 maps Instant to a JDBC TIMESTAMP type. The SQLite
// JDBC driver's getTimestamp() cannot parse the ISO-8601 nanosecond strings we store
// ("2026-05-04T15:08:11.966Z"). This converter routes through getString()/setString()
// instead, which always works, and we control the parse/format ourselves.
@Converter(autoApply = true)
public class InstantConverter implements AttributeConverter<Instant, String> {

    @Override
    public String convertToDatabaseColumn(Instant instant) {
        return instant == null ? null : instant.toString();
    }

    @Override
    public Instant convertToEntityAttribute(String value) {
        return value == null ? null : Instant.parse(value);
    }
}
