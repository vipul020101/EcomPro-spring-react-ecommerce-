package com.vip.ecom_proj.auth.dto;

import com.vip.ecom_proj.user.model.UserRole;

public record UserResponse(
        Long id,
        String name,
        String email,
        UserRole role,
        String phone
) {
}
