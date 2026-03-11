package com.vip.ecom_proj.auth;

import com.vip.ecom_proj.auth.dto.AuthResponse;
import com.vip.ecom_proj.auth.dto.LoginRequest;
import com.vip.ecom_proj.auth.dto.SignupRequest;
import com.vip.ecom_proj.auth.dto.UserResponse;
import com.vip.ecom_proj.user.model.AppUser;
import com.vip.ecom_proj.user.model.UserRole;
import com.vip.ecom_proj.user.repo.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public AuthService(UserRepo userRepo, PasswordEncoder passwordEncoder, JwtTokenService jwtTokenService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    public AuthResponse signup(SignupRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepo.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        AppUser user = new AppUser();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPhone(request.phone() == null ? null : request.phone().trim());
        user.setRole(UserRole.CUSTOMER);
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        AppUser saved = userRepo.save(user);
        return buildAuthResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        AppUser user = userRepo.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(AppUser user) {
        String token = jwtTokenService.createToken(user);
        UserResponse userResponse = new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getPhone());
        return new AuthResponse(token, userResponse);
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase();
    }
}
