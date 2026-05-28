package com.ticketbooking.booking_service.client.dto;

import java.util.UUID;

public class InventoryItemDto {

	private UUID ticketCategoryId;

	private Integer quantity;

	public InventoryItemDto() {
	}

	public InventoryItemDto(UUID ticketCategoryId, Integer quantity) {
		this.ticketCategoryId = ticketCategoryId;
		this.quantity = quantity;
	}

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
