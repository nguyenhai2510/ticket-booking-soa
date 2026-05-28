package com.ticketbooking.booking_service.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class BookingItemResponse {

	private UUID id;

	private UUID ticketCategoryId;

	private Integer quantity;

	private BigDecimal price;

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
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

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

}
