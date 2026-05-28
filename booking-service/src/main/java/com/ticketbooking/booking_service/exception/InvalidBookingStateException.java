package com.ticketbooking.booking_service.exception;

import com.ticketbooking.booking_service.entity.BookingStatus;

public class InvalidBookingStateException extends RuntimeException {

	public InvalidBookingStateException(BookingStatus current, String action) {
		super("Cannot " + action + " when booking status is " + current);
	}

}
