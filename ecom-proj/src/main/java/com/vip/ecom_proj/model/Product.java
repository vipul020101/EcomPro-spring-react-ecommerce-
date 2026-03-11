package com.vip.ecom_proj.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    @Column(name = "description")
    private String description;

    private String brand;
    private BigDecimal price;

    // Average rating (0.00 - 5.00)
    @Column(precision = 3, scale = 2)
    private BigDecimal rating;

    private String category;
    private LocalDate releaseDate;

    @JsonAlias("productAvailable")
    private boolean available;

    private int stockQuantity;

    private String imageName;
    private String imageType;

    @JsonIgnore
    @Lob
    private byte[] imageData;

    @JsonIgnore
    public String getDesc() {
        return description;
    }

    public void setDesc(String desc) {
        this.description = desc;
    }

    @JsonIgnore
    public int getQuantity() {
        return stockQuantity;
    }

    public void setQuantity(int quantity) {
        this.stockQuantity = quantity;
    }

    @JsonIgnore
    public boolean isProductAvailable() {
        return available;
    }

    public void setProductAvailable(boolean productAvailable) {
        this.available = productAvailable;
    }
}