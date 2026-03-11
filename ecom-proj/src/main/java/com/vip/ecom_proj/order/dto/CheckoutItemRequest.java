package com.vip.ecom_proj.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CheckoutItemRequest(
        @NotNull Integer productId,
        @Min(1) int quantity
) {
}