package com.ticketbooking.booking_service.client.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class InventoryRequest {

	private UUID bookingId;

	private List<InventoryItemDto> items = new ArrayList<>();

	public UUID getBookingId() {
		return bookingId;
	}

	public void setBookingId(UUID bookingId) {
		this.bookingId = bookingId;
	}

	public List<InventoryItemDto> getItems() {
		return items;
	}

	public void setItems(List<InventoryItemDto> items) {
		this.items = items;
	}

}
