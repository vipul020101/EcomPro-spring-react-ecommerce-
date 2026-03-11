package com.vip.ecom_proj.user.dto;

import com.vip.ecom_proj.address.dto.AddressResponse;
import com.vip.ecom_proj.user.model.UserRole;

public record ProfileResponse(
        Long id,
        String name,
        String email,
        String phone,
        UserRole role,
        AddressResponse defaultAddress
) {
}