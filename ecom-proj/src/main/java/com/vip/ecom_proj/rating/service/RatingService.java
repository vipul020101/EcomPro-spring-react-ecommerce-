package com.vip.ecom_proj.rating.service;

import com.vip.ecom_proj.model.Product;
import com.vip.ecom_proj.rating.dto.RatingRequest;
import com.vip.ecom_proj.rating.dto.RatingSummaryResponse;
import com.vip.ecom_proj.rating.model.ProductRating;
import com.vip.ecom_proj.rating.repo.ProductRatingRepo;
import com.vip.ecom_proj.repo.ProductRepo;
import com.vip.ecom_proj.user.model.AppUser;
import com.vip.ecom_proj.user.service.CurrentUserService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Service
public class RatingService {

    private final CurrentUserService currentUserService;
    private final ProductRepo productRepo;
    private final ProductRatingRepo ratingRepo;

    public RatingService(CurrentUserService currentUserService, ProductRepo productRepo, ProductRatingRepo ratingRepo) {
        this.currentUserService = currentUserService;
        this.productRepo = productRepo;
        this.ratingRepo = ratingRepo;
    }

    public RatingSummaryResponse getSummary(Integer productId, Jwt jwt) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        BigDecimal average = product.getRating();
        long count = ratingRepo.ratingCount(productId);
        if (count == 0) {
            average = null;
        }

        Integer myRating = null;
        if (jwt != null) {
            AppUser user = currentUserService.requireUser(jwt);
            myRating = ratingRepo.findByUserIdAndProductId(user.getId(), productId)
                    .map(ProductRating::getRating)
                    .orElse(null);
        }

        return new RatingSummaryResponse(average, count, myRating);
    }

    @Transactional
    public RatingSummaryResponse rate(Integer productId, Jwt jwt, RatingRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing request");
        }

        AppUser user = currentUserService.requireUser(jwt);

        Product product = productRepo.findByIdForUpdate(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        ProductRating rating = ratingRepo.findByUserIdAndProductId(user.getId(), productId)
                .orElseGet(ProductRating::new);

        if (rating.getId() == null) {
            rating.setUser(user);
            rating.setProduct(product);
            rating.setCreatedAt(Instant.now());
        }

        rating.setRating(request.rating());
        rating.setComment(request.comment());
        rating.setUpdatedAt(Instant.now());
        ratingRepo.save(rating);

        Double avg = ratingRepo.averageRating(productId);
        if (avg == null) {
            product.setRating(null);
        } else {
            BigDecimal next = BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP);
            product.setRating(next);
        }
        productRepo.save(product);

        long count = ratingRepo.ratingCount(productId);
        return new RatingSummaryResponse(product.getRating(), count, rating.getRating());
    }
}