package com.vip.ecom_proj.wishlist.repo;

import com.vip.ecom_proj.wishlist.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WishlistRepo extends JpaRepository<WishlistItem, Long> {

    @Query("select w from WishlistItem w join fetch w.product where w.user.id = :userId order by w.createdAt desc")
    List<WishlistItem> findByUserIdWithProduct(@Param("userId") Long userId);

    Optional<WishlistItem> findByUserIdAndProductId(Long userId, Integer productId);
}