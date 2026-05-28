package com.ticketbooking.booking_service.exception;

import java.util.UUID;

public class BookingExpiredException extends RuntimeException {

	public BookingExpiredException(UUID bookingId) {
		super("Booking reservation expired: " + bookingId);
	}

}
