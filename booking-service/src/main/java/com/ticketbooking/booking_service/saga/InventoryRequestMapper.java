package com.ticketbooking.booking_service.saga;

import com.ticketbooking.booking_service.client.dto.InventoryItemDto;
import com.ticketbooking.booking_service.client.dto.InventoryRequest;
import com.ticketbooking.booking_service.entity.Booking;
import com.ticketbooking.booking_service.entity.BookingItem;
import com.ticketbooking.booking_service.service.BookingValidationService.ValidatedLine;

import java.util.List;
import java.util.UUID;

public final class InventoryRequestMapper {

	private InventoryRequestMapper() {
	}

	/**
	 * Prefer validated lines — avoids lazy-loading booking_items after REQUIRES_NEW
	 * commit.
	 */
	public static InventoryRequest fromValidated(UUID bookingId, List<ValidatedLine> lines) {
		InventoryRequest request = new InventoryRequest();
		request.setBookingId(bookingId);
		request.setItems(
				lines.stream().map(line -> new InventoryItemDto(line.ticketCategoryId(), line.quantity())).toList());
		return request;
	}

	public static InventoryRequest fromBooking(Booking booking) {
		InventoryRequest request = new InventoryRequest();
		request.setBookingId(booking.getId());
		List<InventoryItemDto> items = booking.getItems().stream().map(InventoryRequestMapper::toItem).toList();
		request.setItems(items);
		return request;
	}

	private static InventoryItemDto toItem(BookingItem item) {
		return new InventoryItemDto(item.getTicketCategoryId(), item.getQuantity());
	}

}
