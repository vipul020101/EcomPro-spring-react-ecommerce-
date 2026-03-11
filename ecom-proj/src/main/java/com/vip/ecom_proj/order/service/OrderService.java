package com.vip.ecom_proj.order.service;

import com.vip.ecom_proj.address.model.Address;
import com.vip.ecom_proj.address.repo.AddressRepo;
import com.vip.ecom_proj.model.Product;
import com.vip.ecom_proj.order.dto.*;
import com.vip.ecom_proj.order.model.CustomerOrder;
import com.vip.ecom_proj.order.model.OrderItem;
import com.vip.ecom_proj.order.repo.OrderRepo;
import com.vip.ecom_proj.repo.ProductRepo;
import com.vip.ecom_proj.user.model.AppUser;
import com.vip.ecom_proj.user.service.CurrentUserService;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final CurrentUserService currentUserService;
    private final AddressRepo addressRepo;
    private final ProductRepo productRepo;
    private final OrderRepo orderRepo;

    public OrderService(CurrentUserService currentUserService, AddressRepo addressRepo, ProductRepo productRepo, OrderRepo orderRepo) {
        this.currentUserService = currentUserService;
        this.addressRepo = addressRepo;
        this.productRepo = productRepo;
        this.orderRepo = orderRepo;
    }

    @Transactional
    public OrderResponse checkout(Jwt jwt, CheckoutRequest request) {
        AppUser user = currentUserService.requireUser(jwt);
        Address address = resolveAddress(user.getId(), request.addressId());

        CustomerOrder order = new CustomerOrder();
        order.setUser(user);
        order.setShipLabel(address.getLabel());
        order.setShipLine1(address.getLine1());
        order.setShipLine2(address.getLine2());
        order.setShipCity(address.getCity());
        order.setShipState(address.getState());
        order.setShipPostalCode(address.getPostalCode());
        order.setShipCountry(address.getCountry());
        order.setShipPhone(address.getPhone());

        BigDecimal total = BigDecimal.ZERO;
        for (CheckoutItemRequest item : request.items()) {
            Product product = productRepo.findByIdForUpdate(item.productId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: " + item.productId()));

            if (item.quantity() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid quantity");
            }

            int stock = product.getStockQuantity();
            if (stock < item.quantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient stock for " + product.getName());
            }

            int updatedStock = stock - item.quantity();
            product.setStockQuantity(updatedStock);
            product.setAvailable(updatedStock > 0);
            productRepo.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(product.getId());
            orderItem.setProductName(product.getName());
            orderItem.setUnitPrice(product.getPrice() == null ? BigDecimal.ZERO : product.getPrice());
            orderItem.setQuantity(item.quantity());
            order.getItems().add(orderItem);

            total = total.add(orderItem.getUnitPrice().multiply(BigDecimal.valueOf(orderItem.getQuantity())));
        }

        order.setTotal(total);

        CustomerOrder saved = orderRepo.save(order);
        return toResponse(saved);
    }

    public List<OrderResponse> list(Jwt jwt) {
        AppUser user = currentUserService.requireUser(jwt);
        return orderRepo.findByUserIdOrderByCreatedAtDesc(user.getId()).stream().map(this::toResponse).toList();
    }

    public OrderResponse get(Jwt jwt, Long id) {
        AppUser user = currentUserService.requireUser(jwt);
        CustomerOrder order = orderRepo.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        return toResponse(order);
    }

    private Address resolveAddress(Long userId, Long addressId) {
        if (addressId != null) {
            return addressRepo.findByIdAndUserId(addressId, userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));
        }

        return addressRepo.findByUserIdOrderByIsDefaultDescIdAsc(userId).stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No saved address found"));
    }

    private OrderResponse toResponse(CustomerOrder order) {
        ShippingAddressResponse shipping = new ShippingAddressResponse(
                order.getShipLabel(),
                order.getShipLine1(),
                order.getShipLine2(),
                order.getShipCity(),
                order.getShipState(),
                order.getShipPostalCode(),
                order.getShipCountry(),
                order.getShipPhone()
        );

        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> new OrderItemResponse(item.getProductId(), item.getProductName(), item.getUnitPrice(), item.getQuantity()))
                .toList();

        return new OrderResponse(order.getId(), order.getCreatedAt(), order.getStatus(), order.getTotal(), shipping, items);
    }
}