package com.vip.ecom_proj.controller;

import com.vip.ecom_proj.model.Product;
import com.vip.ecom_proj.product.dto.AdjustStockRequest;
import com.vip.ecom_proj.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return new ResponseEntity<>(service.getAllProducts(), HttpStatus.OK);
    }

    @GetMapping("/products/paged")
    public ResponseEntity<Page<Product>> getProductsPaged(@RequestParam(value = "keyword", required = false) String keyword,
                                                          @RequestParam(value = "q", required = false) String q,
                                                          @RequestParam(value = "name", required = false) String name,
                                                          @RequestParam(value = "title", required = false) String title,
                                                          @RequestParam(value = "category", required = false) String category,
                                                          @RequestParam(value = "brand", required = false) String brand,
                                                          @RequestParam(value = "available", required = false) Boolean available,
                                                          @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
                                                          @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
                                                          @RequestParam(value = "minRating", required = false) BigDecimal minRating,
                                                          @RequestParam(value = "maxRating", required = false) BigDecimal maxRating,
                                                          Pageable pageable) {
        String finalKeyword = keyword;
        if (finalKeyword == null || finalKeyword.isBlank()) {
            finalKeyword = q;
        }
        if (finalKeyword == null || finalKeyword.isBlank()) {
            finalKeyword = name;
        }
        if (finalKeyword == null || finalKeyword.isBlank()) {
            finalKeyword = title;
        }

        return ResponseEntity.ok(service.getProductsPaged(finalKeyword, category, brand, available, minPrice, maxPrice, minRating, maxRating, pageable));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(service.getCategories());
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable int id) {
        Product product = service.getProduct(id);
        if (product != null) {
            return new ResponseEntity<>(product, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping(value = "/product", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addProductForm(@ModelAttribute Product modelProduct,
                                            @RequestPart(value = "product", required = false) Product productPart,
                                            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile,
                                            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            Product payload = resolveProduct(modelProduct, productPart);
            Product saved = service.addProduct(payload, pickImage(imageFile, image));
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/product", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addProductJson(@RequestBody Product product) {
        try {
            Product saved = service.addProduct(product, null);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/product/{id}/stock")
    public ResponseEntity<Product> adjustStock(@PathVariable int id, @Valid @RequestBody AdjustStockRequest request) {
        return ResponseEntity.ok(service.adjustStock(id, request));
    }

    @GetMapping("/product/{productId}/image")
    public ResponseEntity<byte[]> getImageByProductId(@PathVariable int productId) {
        Product product = service.getProduct(productId);
        if (product == null || product.getImageData() == null || product.getImageType() == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return ResponseEntity.ok()
                .contentType(MediaType.valueOf(product.getImageType()))
                .body(product.getImageData());
    }

    @PutMapping(value = "/product/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> updateProductForm(@PathVariable int id,
                                                    @ModelAttribute Product modelProduct,
                                                    @RequestPart(value = "product", required = false) Product productPart,
                                                    @RequestPart(value = "imageFile", required = false) MultipartFile imageFile,
                                                    @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            Product payload = resolveProduct(modelProduct, productPart);
            Product updated = service.updateProduct(id, payload, pickImage(imageFile, image));
            if (updated != null) {
                return new ResponseEntity<>("Updated", HttpStatus.OK);
            }
            return new ResponseEntity<>("Failed to update", HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to update", HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping(value = "/product/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> updateProductJson(@PathVariable int id, @RequestBody Product product) {
        try {
            Product updated = service.updateProduct(id, product, null);
            if (updated != null) {
                return new ResponseEntity<>("Updated", HttpStatus.OK);
            }
            return new ResponseEntity<>("Failed to update", HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to update", HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/product/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable int id) {
        Product product = service.getProduct(id);
        if (product != null) {
            service.deleteProduct(id);
            return new ResponseEntity<>("Deleted", HttpStatus.OK);
        }
        return new ResponseEntity<>("Product not found", HttpStatus.NOT_FOUND);
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam(value = "keyword", required = false) String keyword,
                                                        @RequestParam(value = "name", required = false) String name,
                                                        @RequestParam(value = "q", required = false) String q) {
        String finalKeyword = keyword;
        if (finalKeyword == null || finalKeyword.isBlank()) {
            finalKeyword = name;
        }
        if (finalKeyword == null || finalKeyword.isBlank()) {
            finalKeyword = q;
        }

        List<Product> products = service.searchProducts(finalKeyword);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    private MultipartFile pickImage(MultipartFile imageFile, MultipartFile image) {
        if (imageFile != null && !imageFile.isEmpty()) {
            return imageFile;
        }
        if (image != null && !image.isEmpty()) {
            return image;
        }
        return null;
    }

    private Product resolveProduct(Product modelProduct, Product productPart) {
        if (productPart != null && hasCoreContent(productPart)) {
            return productPart;
        }
        return modelProduct;
    }

    private boolean hasCoreContent(Product product) {
        return product.getName() != null || product.getDescription() != null || product.getBrand() != null
                || product.getCategory() != null || product.getPrice() != null || product.getReleaseDate() != null;
    }
}