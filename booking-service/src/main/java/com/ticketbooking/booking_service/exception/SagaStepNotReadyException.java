package com.ticketbooking.booking_service.exception;

public class SagaStepNotReadyException extends RuntimeException {

	public SagaStepNotReadyException(String message) {
		super(message);
	}

}
