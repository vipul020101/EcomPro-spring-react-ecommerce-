package com.vip.ecom_proj.user.controller;

import com.vip.ecom_proj.address.dto.AddressResponse;
import com.vip.ecom_proj.address.model.Address;
import com.vip.ecom_proj.address.repo.AddressRepo;
import com.vip.ecom_proj.user.dto.ProfileResponse;
import com.vip.ecom_proj.user.dto.UpdateProfileRequest;
import com.vip.ecom_proj.user.model.AppUser;
import com.vip.ecom_proj.user.repo.UserRepo;
import com.vip.ecom_proj.user.service.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/me")
@CrossOrigin
public class ProfileController {

    private final CurrentUserService currentUserService;
    private final UserRepo userRepo;
    private final AddressRepo addressRepo;

    public ProfileController(CurrentUserService currentUserService, UserRepo userRepo, AddressRepo addressRepo) {
        this.currentUserService = currentUserService;
        this.userRepo = userRepo;
        this.addressRepo = addressRepo;
    }

    @GetMapping
    public ProfileResponse me(@AuthenticationPrincipal Jwt jwt) {
        AppUser user = currentUserService.requireUser(jwt);
        AddressResponse defaultAddress = defaultAddress(user.getId()).orElse(null);
        return new ProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getRole(), defaultAddress);
    }

    @PutMapping
    public ProfileResponse update(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody UpdateProfileRequest request) {
        AppUser user = currentUserService.requireUser(jwt);
        user.setName(request.name().trim());
        user.setPhone(request.phone() == null ? null : request.phone().trim());
        AppUser saved = userRepo.save(user);
        AddressResponse defaultAddress = defaultAddress(saved.getId()).orElse(null);
        return new ProfileResponse(saved.getId(), saved.getName(), saved.getEmail(), saved.getPhone(), saved.getRole(), defaultAddress);
    }

    private Optional<AddressResponse> defaultAddress(Long userId) {
        return addressRepo.findByUserIdOrderByIsDefaultDescIdAsc(userId).stream()
                .filter(Address::isDefault)
                .findFirst()
                .map(this::toResponse);
    }

    private AddressResponse toResponse(Address address) {
        return new AddressResponse(
                address.getId(),
                address.getLabel(),
                address.getLine1(),
                address.getLine2(),
                address.getCity(),
                address.getState(),
                address.getPostalCode(),
                address.getCountry(),
                address.getPhone(),
                address.isDefault()
        );
    }
}