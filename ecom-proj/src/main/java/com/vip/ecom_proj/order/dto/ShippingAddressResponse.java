package com.vip.ecom_proj.order.dto;

public record ShippingAddressResponse(
        String label,
        String line1,
        String line2,
        String city,
        String state,
        String postalCode,
        String country,
        String phone
) {
}