package com.ticketbooking.booking_service.exception;

public class InvalidBookingRequestException extends RuntimeException {

	public InvalidBookingRequestException(String message) {
		super(message);
	}

}
