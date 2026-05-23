package com.ticketbooking.booking_service.service;

import com.ticketbooking.booking_service.entity.Booking;
import com.ticketbooking.booking_service.repository.BookingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RestTemplate restTemplate;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Placeholder flow for Sprint 3 — will be extended with booking_items and lb://event-service.
     */
    public Booking createBooking(UUID userId, UUID eventId) {
        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setEventId(eventId);
        booking.setTotalAmount(BigDecimal.ZERO);
        booking.setStatus("PENDING");
        booking = bookingRepository.save(booking);

        String eventServiceUrl = "http://localhost:8082/api/events/" + eventId + "/deduct";

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(eventServiceUrl, null, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                booking.setStatus("SUCCESS");
            } else {
                booking.setStatus("FAILED");
            }
        } catch (Exception e) {
            booking.setStatus("FAILED");
        }

        return bookingRepository.save(booking);
    }
}
