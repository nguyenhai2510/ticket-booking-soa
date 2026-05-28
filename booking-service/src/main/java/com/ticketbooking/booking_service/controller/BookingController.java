package com.ticketbooking.booking_service.controller;

import com.ticketbooking.booking_service.dto.BookingResponse;
import com.ticketbooking.booking_service.dto.ConfirmPaymentRequest;
import com.ticketbooking.booking_service.dto.CreateBookingRequest;
import com.ticketbooking.booking_service.saga.BookingSagaOrchestrator;
import com.ticketbooking.booking_service.service.BookingQueryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

	private final BookingSagaOrchestrator sagaOrchestrator;

	private final BookingQueryService bookingQueryService;

	public BookingController(BookingSagaOrchestrator sagaOrchestrator, BookingQueryService bookingQueryService) {
		this.sagaOrchestrator = sagaOrchestrator;
		this.bookingQueryService = bookingQueryService;
	}

	@PostMapping
	public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request) {
		BookingResponse response = sagaOrchestrator.startBooking(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping("/{id}")
	public ResponseEntity<BookingResponse> getBooking(@PathVariable UUID id) {
		return ResponseEntity.ok(bookingQueryService.getById(id));
	}

	@PostMapping("/{id}/confirm-payment")
	public ResponseEntity<BookingResponse> confirmPayment(@PathVariable UUID id,
			@RequestBody(required = false) ConfirmPaymentRequest request) {
		ConfirmPaymentRequest body = request != null ? request : new ConfirmPaymentRequest();
		return ResponseEntity.ok(sagaOrchestrator.confirmPayment(id, body));
	}

	@PostMapping("/{id}/cancel")
	public ResponseEntity<BookingResponse> cancelBooking(@PathVariable UUID id) {
		return ResponseEntity.ok(sagaOrchestrator.cancelBooking(id));
	}

}
