package com.mundas.budgetapp.repository;

import com.mundas.budgetapp.domain.Subcategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubcategoryRepository extends JpaRepository<Subcategory, Long> {

    // Used by the fill-blanks budget operation to discover all available subcategories.
    List<Subcategory> findByActiveTrue();
}
