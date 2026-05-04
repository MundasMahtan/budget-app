package com.mundas.budgetapp.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    // scale and precision are metadata for schema generation tools and documentation.
    // We do NOT rely on the database for scale enforcement — that lives in the service
    // layer (setScale(2, HALF_UP) before every save).
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(length = 255)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subcategory_id", nullable = false)
    private Subcategory subcategory;

    // insertable = true, updatable = false:
    // Hibernate includes this column in INSERT statements but never in UPDATE statements.
    // This enforces the immutability rule at the persistence layer — even if someone
    // calls setCreatedAt() before a save, Hibernate will ignore it on UPDATE.
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(nullable = false)
    private boolean deleted = false;
}
