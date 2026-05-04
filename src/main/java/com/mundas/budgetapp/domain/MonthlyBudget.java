package com.mundas.budgetapp.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(
    name = "monthly_budgets",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_budget_year_month_subcategory",
        columnNames = {"year", "month", "subcategory_id"}
    )
)
@Getter
@Setter
@NoArgsConstructor
public class MonthlyBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int year;

    @Column(nullable = false)
    private int month;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subcategory_id", nullable = false)
    private Subcategory subcategory;

    @Column(name = "projected_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal projectedAmount;
}
