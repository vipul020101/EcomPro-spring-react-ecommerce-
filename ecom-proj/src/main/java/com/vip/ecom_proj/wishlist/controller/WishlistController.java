package com.vip.ecom_proj.wishlist.controller;

import com.vip.ecom_proj.model.Product;
import com.vip.ecom_proj.repo.ProductRepo;
import com.vip.ecom_proj.user.model.AppUser;
import com.vip.ecom_proj.user.service.CurrentUserService;
import com.vip.ecom_proj.wishlist.model.WishlistItem;
import com.vip.ecom_proj.wishlist.repo.WishlistRepo;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin
public class WishlistController {

    private final CurrentUserService currentUserService;
    private final WishlistRepo wishlistRepo;
    private final ProductRepo productRepo;

    public WishlistController(CurrentUserService currentUserService, WishlistRepo wishlistRepo, ProductRepo productRepo) {
        this.currentUserService = currentUserService;
        this.wishlistRepo = wishlistRepo;
        this.productRepo = productRepo;
    }

    @GetMapping
    public List<Product> list(@AuthenticationPrincipal Jwt jwt) {
        AppUser user = currentUserService.requireUser(jwt);
        return wishlistRepo.findByUserIdWithProduct(user.getId()).stream().map(WishlistItem::getProduct).toList();
    }

    @PostMapping("/{productId}")
    public void add(@AuthenticationPrincipal Jwt jwt, @PathVariable Integer productId) {
        AppUser user = currentUserService.requireUser(jwt);
        if (wishlistRepo.findByUserIdAndProductId(user.getId(), productId).isPresent()) {
            return;
        }

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setProduct(product);
        wishlistRepo.save(item);
    }

    @DeleteMapping("/{productId}")
    public void remove(@AuthenticationPrincipal Jwt jwt, @PathVariable Integer productId) {
        AppUser user = currentUserService.requireUser(jwt);
        WishlistItem item = wishlistRepo.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Not in wishlist"));
        wishlistRepo.delete(item);
    }
}