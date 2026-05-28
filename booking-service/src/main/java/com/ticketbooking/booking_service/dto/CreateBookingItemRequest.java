package com.ticketbooking.booking_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class CreateBookingItemRequest {

	@NotNull
	private UUID ticketCategoryId;

	@NotNull
	@Min(1)
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
