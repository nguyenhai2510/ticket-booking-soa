package com.ticketbooking.booking_service.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public class CreateBookingRequest {

	@NotNull
	private UUID userId;

	@NotNull
	private UUID eventId;

	@NotEmpty
	@Valid
	private List<CreateBookingItemRequest> items;

	public UUID getUserId() {
		return userId;
	}

	public void setUserId(UUID userId) {
		this.userId = userId;
	}

	public UUID getEventId() {
		return eventId;
	}

	public void setEventId(UUID eventId) {
		this.eventId = eventId;
	}

	public List<CreateBookingItemRequest> getItems() {
		return items;
	}

	public void setItems(List<CreateBookingItemRequest> items) {
		this.items = items;
	}

}
