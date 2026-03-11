package com.vip.ecom_proj.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CheckoutRequest(
        Long addressId,
        @NotEmpty @Valid List<CheckoutItemRequest> items
) {
}