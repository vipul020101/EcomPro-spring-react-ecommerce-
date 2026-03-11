package com.vip.ecom_proj.address.service;

import com.vip.ecom_proj.address.dto.AddressResponse;
import com.vip.ecom_proj.address.dto.UpsertAddressRequest;
import com.vip.ecom_proj.address.model.Address;
import com.vip.ecom_proj.address.repo.AddressRepo;
import com.vip.ecom_proj.user.model.AppUser;
import com.vip.ecom_proj.user.service.CurrentUserService;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AddressService {

    private final AddressRepo addressRepo;
    private final CurrentUserService currentUserService;

    public AddressService(AddressRepo addressRepo, CurrentUserService currentUserService) {
        this.addressRepo = addressRepo;
        this.currentUserService = currentUserService;
    }

    public List<AddressResponse> list(Jwt jwt) {
        AppUser user = currentUserService.requireUser(jwt);
        return addressRepo.findByUserIdOrderByIsDefaultDescIdAsc(user.getId()).stream().map(this::toResponse).toList();
    }

    @Transactional
    public AddressResponse create(Jwt jwt, UpsertAddressRequest request) {
        AppUser user = currentUserService.requireUser(jwt);

        Address address = new Address();
        address.setUser(user);
        apply(address, request);

        boolean shouldBeDefault = request.isDefault() || addressRepo.countByUserId(user.getId()) == 0;
        if (shouldBeDefault) {
            clearDefault(user.getId());
            address.setDefault(true);
        }

        return toResponse(addressRepo.save(address));
    }

    @Transactional
    public AddressResponse update(Jwt jwt, Long id, UpsertAddressRequest request) {
        AppUser user = currentUserService.requireUser(jwt);
        Address address = addressRepo.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));

        apply(address, request);
        if (request.isDefault()) {
            clearDefault(user.getId());
            address.setDefault(true);
        }

        return toResponse(addressRepo.save(address));
    }

    @Transactional
    public void delete(Jwt jwt, Long id) {
        AppUser user = currentUserService.requireUser(jwt);
        Address address = addressRepo.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));

        boolean wasDefault = address.isDefault();
        addressRepo.delete(address);

        if (wasDefault) {
            addressRepo.findByUserIdOrderByIsDefaultDescIdAsc(user.getId()).stream().findFirst().ifPresent(next -> {
                clearDefault(user.getId());
                next.setDefault(true);
                addressRepo.save(next);
            });
        }
    }

    @Transactional
    public AddressResponse setDefault(Jwt jwt, Long id) {
        AppUser user = currentUserService.requireUser(jwt);
        Address address = addressRepo.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));

        clearDefault(user.getId());
        address.setDefault(true);
        return toResponse(addressRepo.save(address));
    }

    private void clearDefault(Long userId) {
        addressRepo.findByUserIdOrderByIsDefaultDescIdAsc(userId).forEach(a -> {
            if (a.isDefault()) {
                a.setDefault(false);
                addressRepo.save(a);
            }
        });
    }

    private void apply(Address address, UpsertAddressRequest request) {
        address.setLabel(request.label().trim());
        address.setLine1(request.line1().trim());
        address.setLine2(request.line2() == null ? null : request.line2().trim());
        address.setCity(request.city().trim());
        address.setState(request.state().trim());
        address.setPostalCode(request.postalCode().trim());
        address.setCountry(request.country().trim());
        address.setPhone(request.phone() == null ? null : request.phone().trim());
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