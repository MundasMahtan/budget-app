package com.mundas.budgetapp.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.LocalDate;

// Same pattern as InstantConverter: the SQLite JDBC driver's getDate() cannot reliably
// parse 'YYYY-MM-DD' strings stored by Hibernate. Routing through getString() works correctly.
@Converter(autoApply = true)
public class LocalDateConverter implements AttributeConverter<LocalDate, String> {

    @Override
    public String convertToDatabaseColumn(LocalDate date) {
        return date == null ? null : date.toString();
    }

    @Override
    public LocalDate convertToEntityAttribute(String value) {
        return value == null ? null : LocalDate.parse(value);
    }
}
