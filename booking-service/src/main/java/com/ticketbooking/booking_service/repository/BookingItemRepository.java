package com.ticketbooking.booking_service.repository;

import com.ticketbooking.booking_service.entity.BookingItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BookingItemRepository extends JpaRepository<BookingItem, UUID> {
}
