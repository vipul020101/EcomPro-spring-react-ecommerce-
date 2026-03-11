package com.vip.ecom_proj.address.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpsertAddressRequest(
        @NotBlank @Size(max = 60) String label,
        @NotBlank @Size(max = 120) String line1,
        @Size(max = 120) String line2,
        @NotBlank @Size(max = 60) String city,
        @NotBlank @Size(max = 60) String state,
        @NotBlank @Size(max = 20) String postalCode,
        @NotBlank @Size(max = 60) String country,
        @Size(max = 40) String phone,
        boolean isDefault
) {
}