package com.vip.ecom_proj.address.controller;

import com.vip.ecom_proj.address.dto.AddressResponse;
import com.vip.ecom_proj.address.dto.UpsertAddressRequest;
import com.vip.ecom_proj.address.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/me/addresses")
@CrossOrigin
public class AddressController {

    private final AddressService service;

    public AddressController(AddressService service) {
        this.service = service;
    }

    @GetMapping
    public List<AddressResponse> list(@AuthenticationPrincipal Jwt jwt) {
        return service.list(jwt);
    }

    @PostMapping
    public AddressResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody UpsertAddressRequest request) {
        return service.create(jwt, request);
    }

    @PutMapping("/{id}")
    public AddressResponse update(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @Valid @RequestBody UpsertAddressRequest request) {
        return service.update(jwt, id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        service.delete(jwt, id);
    }

    @PostMapping("/{id}/default")
    public AddressResponse setDefault(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return service.setDefault(jwt, id);
    }
}