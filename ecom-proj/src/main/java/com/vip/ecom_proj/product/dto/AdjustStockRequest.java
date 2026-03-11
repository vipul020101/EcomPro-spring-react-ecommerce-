package com.vip.ecom_proj.product.dto;

import jakarta.validation.constraints.NotNull;

public record AdjustStockRequest(
        Integer stockQuantity,
        Integer delta
) {
    public void validate() {
        boolean hasSet = stockQuantity != null;
        boolean hasDelta = delta != null;
        if (hasSet == hasDelta) {
            throw new IllegalArgumentException("Provide exactly one of stockQuantity or delta");
        }
    }
}