package com.vip.ecom_proj.rating.repo;

import com.vip.ecom_proj.rating.model.ProductRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRatingRepo extends JpaRepository<ProductRating, Long> {

    Optional<ProductRating> findByUserIdAndProductId(Long userId, Integer productId);

    @Query("select avg(r.rating) from ProductRating r where r.product.id = :productId")
    Double averageRating(@Param("productId") Integer productId);

    @Query("select count(r) from ProductRating r where r.product.id = :productId")
    long ratingCount(@Param("productId") Integer productId);
}