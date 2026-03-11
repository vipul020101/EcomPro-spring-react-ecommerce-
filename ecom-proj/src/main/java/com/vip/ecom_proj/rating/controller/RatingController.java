package com.vip.ecom_proj.rating.controller;

import com.vip.ecom_proj.rating.dto.RatingRequest;
import com.vip.ecom_proj.rating.dto.RatingSummaryResponse;
import com.vip.ecom_proj.rating.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @GetMapping("/products/{id}/rating")
    public RatingSummaryResponse summary(@PathVariable("id") Integer productId,
                                         @AuthenticationPrincipal Jwt jwt) {
        return ratingService.getSummary(productId, jwt);
    }

    @PostMapping("/products/{id}/rating")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')")
    public RatingSummaryResponse rate(@PathVariable("id") Integer productId,
                                      @AuthenticationPrincipal Jwt jwt,
                                      @Valid @RequestBody RatingRequest request) {
        return ratingService.rate(productId, jwt, request);
    }
}