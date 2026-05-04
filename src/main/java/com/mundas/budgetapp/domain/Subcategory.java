package com.mundas.budgetapp.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "subcategories")
@Getter
@Setter
@NoArgsConstructor
public class Subcategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // @ManyToOne: many Subcategories belong to one Category.
    // This side OWNS the relationship — it holds the FK column (category_id).
    //
    // fetch = LAZY means Hibernate loads a proxy object (a stub) instead of
    // immediately hitting the database for the Category row. The real query
    // fires only if you call subcategory.getCategory().getName() etc.
    //
    // Why LAZY here? If you load 50 subcategories for a list view, you probably
    // don't need the parent category for each one. EAGER would fire 50 extra
    // SELECT queries (one per subcategory) automatically — the classic N+1 problem.
    // With LAZY you control exactly when to join.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
