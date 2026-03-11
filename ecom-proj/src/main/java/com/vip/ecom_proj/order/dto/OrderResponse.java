package com.vip.ecom_proj.order.dto;

import com.vip.ecom_proj.order.model.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        Instant createdAt,
        OrderStatus status,
        BigDecimal total,
        ShippingAddressResponse shipping,
        List<OrderItemResponse> items
) {
}