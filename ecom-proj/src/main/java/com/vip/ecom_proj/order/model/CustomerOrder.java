package com.vip.ecom_proj.order.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.vip.ecom_proj.user.model.AppUser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customer_order")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PLACED;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    // Shipping snapshot
    @Column(nullable = false)
    private String shipLabel;

    @Column(nullable = false)
    private String shipLine1;

    private String shipLine2;

    @Column(nullable = false)
    private String shipCity;

    @Column(nullable = false)
    private String shipState;

    @Column(nullable = false)
    private String shipPostalCode;

    @Column(nullable = false)
    private String shipCountry;

    private String shipPhone;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();
}