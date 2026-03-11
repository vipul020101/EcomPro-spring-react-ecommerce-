package com.vip.ecom_proj.auth;

import com.vip.ecom_proj.user.model.AppUser;
import com.vip.ecom_proj.user.model.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class JwtTokenServiceTests {

    @Autowired
    JwtTokenService jwtTokenService;

    @Test
    void createsHs256Jwt() {
        AppUser user = new AppUser();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setName("Test");
        user.setRole(UserRole.CUSTOMER);
        user.setPasswordHash("x");

        String token = jwtTokenService.createToken(user);
        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3);
    }
}