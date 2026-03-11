package com.vip.ecom_proj.product;

import com.vip.ecom_proj.model.Product;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public final class ProductSpecifications {

    private ProductSpecifications() {
    }

    public static Specification<Product> keyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }
        String like = "%" + keyword.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(cb.coalesce(root.get("name"), "")), like),
                cb.like(cb.lower(cb.coalesce(root.get("description"), "")), like),
                cb.like(cb.lower(cb.coalesce(root.get("brand"), "")), like)
        );
    }

    public static Specification<Product> category(String category) {
        if (category == null || category.isBlank()) {
            return null;
        }
        String value = category.trim().toLowerCase();
        return (root, query, cb) -> cb.equal(cb.lower(cb.coalesce(root.get("category"), "")), value);
    }

    public static Specification<Product> brand(String brand) {
        if (brand == null || brand.isBlank()) {
            return null;
        }
        String value = brand.trim().toLowerCase();
        return (root, query, cb) -> cb.equal(cb.lower(cb.coalesce(root.get("brand"), "")), value);
    }

    public static Specification<Product> available(Boolean available) {
        if (available == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("available"), available);
    }

    public static Specification<Product> minPrice(BigDecimal minPrice) {
        if (minPrice == null) {
            return null;
        }
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice);
    }

    public static Specification<Product> maxPrice(BigDecimal maxPrice) {
        if (maxPrice == null) {
            return null;
        }
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice);
    }

    public static Specification<Product> minRating(BigDecimal minRating) {
        if (minRating == null) {
            return null;
        }
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("rating"), minRating);
    }

    public static Specification<Product> maxRating(BigDecimal maxRating) {
        if (maxRating == null) {
            return null;
        }
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("rating"), maxRating);
    }
}