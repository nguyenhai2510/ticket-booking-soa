package com.ticketbooking.booking_service.dto;

import com.ticketbooking.booking_service.entity.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class BookingResponse {

	private UUID id;

	private UUID userId;

	private UUID eventId;

	private BigDecimal totalAmount;

	private BookingStatus status;

	private LocalDateTime bookingTime;

	private LocalDateTime reservedUntil;

	private List<BookingItemResponse> items = new ArrayList<>();

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

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

	public BigDecimal getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(BigDecimal totalAmount) {
		this.totalAmount = totalAmount;
	}

	public BookingStatus getStatus() {
		return status;
	}

	public void setStatus(BookingStatus status) {
		this.status = status;
	}

	public LocalDateTime getBookingTime() {
		return bookingTime;
	}

	public void setBookingTime(LocalDateTime bookingTime) {
		this.bookingTime = bookingTime;
	}

	public LocalDateTime getReservedUntil() {
		return reservedUntil;
	}

	public void setReservedUntil(LocalDateTime reservedUntil) {
		this.reservedUntil = reservedUntil;
	}

	public List<BookingItemResponse> getItems() {
		return items;
	}

	public void setItems(List<BookingItemResponse> items) {
		this.items = items;
	}

}
