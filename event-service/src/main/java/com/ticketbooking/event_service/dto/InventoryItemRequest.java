package com.ticketbooking.event_service.dto;

import java.util.UUID;

public class InventoryItemRequest {

	private UUID ticketCategoryId;

	private Integer quantity;

	public UUID getTicketCategoryId() {
		return ticketCategoryId;
	}

	public void setTicketCategoryId(UUID ticketCategoryId) {
		this.ticketCategoryId = ticketCategoryId;
	}

	public Integer getQuantity() {
		return quantity;
	}

	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}

}
