package com.ticketbooking.event_service.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class InventoryRequest {

	private UUID bookingId;

	private List<InventoryItemRequest> items = new ArrayList<>();

	public UUID getBookingId() {
		return bookingId;
	}

	public void setBookingId(UUID bookingId) {
		this.bookingId = bookingId;
	}

	public List<InventoryItemRequest> getItems() {
		return items;
	}

	public void setItems(List<InventoryItemRequest> items) {
		this.items = items;
	}

}
