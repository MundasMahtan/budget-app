package com.mundas.budgetapp.repository;

import com.mundas.budgetapp.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    // JOIN FETCH loads categories and their subcategories in a single SQL query
    // (one JOIN, not N+1 round trips). DISTINCT is needed here because a JOIN
    // across a one-to-many produces duplicate Category rows in the SQL result set
    // (one per subcategory) — DISTINCT collapses them back to one Category per id.
    //
    // Hibernate 6 is smart about this: it strips DISTINCT from the SQL (SQLite
    // doesn't need it to deduplicate joins), applies the deduplication in memory,
    // and still correctly populates the subcategories list.
    @Query("""
            SELECT DISTINCT c FROM Category c
            JOIN FETCH c.subcategories s
            WHERE c.active = true AND s.active = true
            ORDER BY c.displayOrder
            """)
    List<Category> findAllActiveWithSubcategories();
}
