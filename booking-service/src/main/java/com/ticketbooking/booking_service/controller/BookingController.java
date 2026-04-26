package com.ticketbooking.booking_service.controller;

import com.ticketbooking.booking_service.entity.Booking;
import com.ticketbooking.booking_service.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Dùng DTO tạm thời gộp trong code cho nhanh
    public static class BookingRequest {
        public String userId;
        public String eventId;
    }

    @PostMapping
    public ResponseEntity<Booking> bookTicket(@RequestBody BookingRequest request) {
        Booking booking = bookingService.createBooking(
                request.userId, 
                java.util.UUID.fromString(request.eventId)
        );
        return ResponseEntity.ok(booking);
    }
}