package com.vip.ecom_proj.address.dto;

public record AddressResponse(
        Long id,
        String label,
        String line1,
        String line2,
        String city,
        String state,
        String postalCode,
        String country,
        String phone,
        boolean isDefault
) {
}