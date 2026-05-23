package com.ticketbooking.booking_service.controller;

import com.ticketbooking.booking_service.entity.Booking;
import com.ticketbooking.booking_service.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    public static class BookingRequest {

        public UUID userId;

        public UUID eventId;
    }

    @PostMapping
    public ResponseEntity<Booking> bookTicket(@RequestBody BookingRequest request) {
        Booking booking = bookingService.createBooking(request.userId, request.eventId);
        return ResponseEntity.ok(booking);
    }
}
