package com.ticketbooking.event_service.exception;

import java.util.UUID;

public class TicketCategoryNotFoundException extends RuntimeException {

	public TicketCategoryNotFoundException(UUID id) {
		super("Ticket category not found: " + id);
	}

}
