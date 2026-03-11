package com.vip.ecom_proj.rating.dto;

import java.math.BigDecimal;

public record RatingSummaryResponse(
        BigDecimal average,
        long count,
        Integer myRating
) {
}