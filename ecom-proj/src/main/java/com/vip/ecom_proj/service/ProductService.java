package com.vip.ecom_proj.service;

import com.vip.ecom_proj.model.Product;
import com.vip.ecom_proj.product.ProductSpecifications;
import com.vip.ecom_proj.product.dto.AdjustStockRequest;
import com.vip.ecom_proj.repo.ProductRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepo repo;

    public ProductService(ProductRepo repo) {
        this.repo = repo;
    }

    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    public Page<Product> getProductsPaged(String keyword,
                                          String category,
                                          String brand,
                                          Boolean available,
                                          BigDecimal minPrice,
                                          BigDecimal maxPrice,
                                          BigDecimal minRating,
                                          BigDecimal maxRating,
                                          Pageable pageable) {
        Specification<Product> spec = null;
        spec = and(spec, ProductSpecifications.keyword(keyword));
        spec = and(spec, ProductSpecifications.category(category));
        spec = and(spec, ProductSpecifications.brand(brand));
        spec = and(spec, ProductSpecifications.available(available));
        spec = and(spec, ProductSpecifications.minPrice(minPrice));
        spec = and(spec, ProductSpecifications.maxPrice(maxPrice));
        spec = and(spec, ProductSpecifications.minRating(minRating));
        spec = and(spec, ProductSpecifications.maxRating(maxRating));

        if (spec == null) {
            return repo.findAll(pageable);
        }

        return repo.findAll(spec, pageable);
    }

    public List<String> getCategories() {
        return repo.findDistinctCategories();
    }

    public Product getProduct(int id) {
        return repo.findById(id).orElse(null);
    }

    public Product addProduct(Product product, MultipartFile imageFile) throws IOException {
        normalizeProduct(product);

        // rating is computed from user reviews; ignore client-provided values
        if (product != null) {
            product.setRating(null);
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            product.setImageName(imageFile.getOriginalFilename());
            product.setImageType(imageFile.getContentType());
            product.setImageData(imageFile.getBytes());
        }
        return repo.save(product);
    }

    public Product updateProduct(int id, Product product, MultipartFile imageFile) throws IOException {
        normalizeProduct(product);

        Product existing = repo.findById(id).orElse(null);

        product.setId(id);

        // rating is computed from user reviews; preserve stored value
        if (existing != null) {
            product.setRating(existing.getRating());
        } else {
            product.setRating(null);
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            product.setImageName(imageFile.getOriginalFilename());
            product.setImageType(imageFile.getContentType());
            product.setImageData(imageFile.getBytes());
        } else {
            if (existing != null) {
                product.setImageName(existing.getImageName());
                product.setImageType(existing.getImageType());
                product.setImageData(existing.getImageData());
            }
        }
        return repo.save(product);
    }

    public Product adjustStock(int id, AdjustStockRequest request) {
        request.validate();

        Product product = repo.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        int nextStock;
        if (request.stockQuantity() != null) {
            nextStock = request.stockQuantity();
        } else {
            nextStock = product.getStockQuantity() + request.delta();
        }

        if (nextStock < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock cannot be negative");
        }

        product.setStockQuantity(nextStock);
        if (nextStock == 0) {
            product.setAvailable(false);
        }

        return repo.save(product);
    }

    public void deleteProduct(int id) {
        repo.deleteById(id);
    }

    public List<Product> searchProducts(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return repo.findAll();
        }
        return repo.searchProducts(keyword.trim());
    }

    private void normalizeProduct(Product product) {
        if (product == null) {
            return;
        }

        if (product.getStockQuantity() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock cannot be negative");
        }

        if (product.getPrice() != null && product.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price cannot be negative");
        }

        if (product.getStockQuantity() == 0) {
            product.setAvailable(false);
        }
    }

    private Specification<Product> and(Specification<Product> base, Specification<Product> next) {
        if (next == null) {
            return base;
        }
        if (base == null) {
            return Specification.where(next);
        }
        return base.and(next);
    }
}