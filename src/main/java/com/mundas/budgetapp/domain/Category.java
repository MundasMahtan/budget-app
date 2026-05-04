package com.mundas.budgetapp.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OrderBy;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // @Enumerated(EnumType.STRING) tells Hibernate to store the enum as its name
    // ("INCOME" / "EXPENSE") rather than its ordinal (0 / 1).
    // Ordinal storage is a trap: adding a value in the middle of the enum silently
    // remaps all existing rows to the wrong value.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoryType type;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    // @OneToMany: one Category has many Subcategories.
    // mappedBy = "category" tells Hibernate that the Subcategory entity OWNS this
    // relationship (it holds the FK column). Category is the inverse side — it
    // just provides a convenient navigation path.
    //
    // fetch = LAZY (the default for collections) means Hibernate does NOT load
    // subcategories when you load a Category. It only loads them if you call
    // getSubcategories(). This is almost always what you want: load only what you need.
    //
    // fetch = EAGER would load all subcategories in every query that touches Category,
    // even when you don't need them — a common N+1 / over-fetching source.
    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    // Hibernate will append "ORDER BY display_order ASC" whenever this collection is loaded.
    // The clause is in SQL column terms, not Java field terms.
    @OrderBy(clause = "display_order ASC")
    private List<Subcategory> subcategories = new ArrayList<>();
}
