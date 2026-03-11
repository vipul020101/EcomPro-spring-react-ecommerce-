package com.vip.ecom_proj.auth.dto;

public record AuthResponse(
        String token,
        UserResponse user
) {
}
