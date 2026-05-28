package com.ticketbooking.booking_service.exception;

public class FeignClientException extends RuntimeException {

	public FeignClientException(String message) {
		super(message);
	}

}
