package com.vip.ecom_proj.repo;

import com.vip.ecom_proj.model.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepo extends JpaRepository<Product, Integer>, JpaSpecificationExecutor<Product> {

    boolean existsByCategoryIgnoreCase(String category);

    boolean existsByNameIgnoreCase(String name);

    @Query("SELECT p FROM Product p WHERE " +
            "LOWER(COALESCE(p.name, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(COALESCE(p.brand, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(COALESCE(p.category, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(STR(p.releaseDate)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(STR(p.price)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(STR(p.stockQuantity)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(CASE WHEN p.available = true THEN 'available' ELSE 'unavailable' END) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchProducts(@Param("keyword") String keyword);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Integer id);

    @Query("select distinct p.category from Product p where p.category is not null order by p.category")
    List<String> findDistinctCategories();
}