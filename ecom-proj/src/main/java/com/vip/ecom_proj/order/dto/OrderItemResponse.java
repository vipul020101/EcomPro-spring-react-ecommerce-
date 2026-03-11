package com.vip.ecom_proj.order.dto;

import java.math.BigDecimal;

public record OrderItemResponse(
        Integer productId,
        String productName,
        BigDecimal unitPrice,
        int quantity
) {
}