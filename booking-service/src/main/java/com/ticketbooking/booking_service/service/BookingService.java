package com.ticketbooking.booking_service.service;

import com.ticketbooking.booking_service.entity.Booking;
import com.ticketbooking.booking_service.repository.BookingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RestTemplate restTemplate;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
        this.restTemplate = new RestTemplate(); // Khởi tạo công cụ gọi HTTP
    }

    public Booking createBooking(String userId, UUID eventId) {
        // 1. Tạo record Booking với trạng thái PENDING
        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setEventId(eventId);
        booking.setStatus("PENDING");
        booking = bookingRepository.save(booking);

        // 2. Gọi HTTP POST sang Event Service (Cổng 8082)
        String eventServiceUrl = "http://localhost:8082/api/events/" + eventId + "/deduct";
        
        try {
            // Thực hiện lệnh gọi. Nếu Event Service trả về 200 OK thì đi tiếp
            ResponseEntity<String> response = restTemplate.postForEntity(eventServiceUrl, null, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                booking.setStatus("SUCCESS");
            } else {
                booking.setStatus("FAILED");
            }
        } catch (Exception e) {
            // Nếu Event Service báo lỗi (VD: hết vé, hoặc server sập)
            booking.setStatus("FAILED");
        }

        // 3. Lưu lại trạng thái cuối cùng
        return bookingRepository.save(booking);
    }
}