package com.vip.ecom_proj.config;

import com.vip.ecom_proj.model.Product;
import com.vip.ecom_proj.repo.ProductRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class ProductSeeder implements CommandLineRunner {

    private final ProductRepo repo;

    public ProductSeeder(ProductRepo repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) {
        ensureCategoryProducts();
    }

    private void ensureCategoryProducts() {
        seedIfMissing("Laptop", "MacBook Pro 14", "Apple", "Laptop with M3 Pro chip", new BigDecimal("2199.00"), LocalDate.of(2025, 10, 22), 15);
        seedIfMissing("Headphone", "WH-1000XM5", "Sony", "Wireless ANC over-ear headphones", new BigDecimal("349.99"), LocalDate.of(2024, 8, 8), 30);
        seedIfMissing("Mobile", "Galaxy S25", "Samsung", "Flagship Android phone", new BigDecimal("999.00"), LocalDate.of(2026, 1, 14), 28);
        seedIfMissing("Electronics", "Smart Air Fryer", "Philips", "Wi-Fi enabled digital air fryer", new BigDecimal("179.50"), LocalDate.of(2025, 6, 2), 24);
        seedIfMissing("Toys", "STEM Robot Kit", "LEGO", "Programmable robot set for kids", new BigDecimal("129.00"), LocalDate.of(2024, 12, 1), 40);
        seedIfMissing("Fashion", "Classic Denim Jacket", "Levi's", "Unisex medium-wash denim jacket", new BigDecimal("89.99"), LocalDate.of(2025, 3, 19), 50);

        if (repo.count() < 12) {
            List<Product> extras = List.of(
                    buildProduct("Laptop", "ThinkPad X1 Carbon", "Lenovo", "Business ultrabook with 14-inch display", new BigDecimal("1699.00"), LocalDate.of(2025, 11, 5), 12),
                    buildProduct("Headphone", "AirPods Max", "Apple", "Premium over-ear wireless headphones", new BigDecimal("549.00"), LocalDate.of(2024, 9, 10), 18),
                    buildProduct("Mobile", "Pixel 10", "Google", "AI-powered camera smartphone", new BigDecimal("899.00"), LocalDate.of(2025, 10, 4), 20),
                    buildProduct("Electronics", "4K Home Projector", "BenQ", "Dolby-ready 4K projector", new BigDecimal("999.00"), LocalDate.of(2025, 5, 12), 10),
                    buildProduct("Toys", "RC Drift Car", "Hot Wheels", "Rechargeable remote control drift car", new BigDecimal("59.99"), LocalDate.of(2024, 7, 29), 35),
                    buildProduct("Fashion", "Runner Sneakers", "Nike", "Lightweight everyday sneakers", new BigDecimal("119.99"), LocalDate.of(2025, 2, 15), 45)
            );
            extras.stream().filter(p -> !existsByName(p.getName())).forEach(repo::save);
        }
    }

    private void seedIfMissing(String category, String name, String brand, String description, BigDecimal price, LocalDate releaseDate, int stock) {
        if (!repo.existsByCategoryIgnoreCase(category)) {
            repo.save(buildProduct(category, name, brand, description, price, releaseDate, stock));
        }
    }

    private boolean existsByName(String name) {
        return repo.existsByNameIgnoreCase(name);
    }

    private Product buildProduct(String category, String name, String brand, String description, BigDecimal price, LocalDate releaseDate, int stock) {
        Product product = new Product();
        product.setName(name);
        product.setBrand(brand);
        product.setDescription(description);
        product.setPrice(price);
        product.setCategory(category);
        product.setReleaseDate(releaseDate);
        product.setAvailable(true);
        product.setStockQuantity(stock);
        return product;
    }
}