package com.ticketbooking.booking_service.mapper;

import com.ticketbooking.booking_service.dto.BookingItemResponse;
import com.ticketbooking.booking_service.dto.BookingResponse;
import com.ticketbooking.booking_service.entity.Booking;
import com.ticketbooking.booking_service.entity.BookingItem;

import java.util.List;
import java.util.stream.Collectors;

public final class BookingMapper {

	private BookingMapper() {
	}

	public static BookingResponse toResponse(Booking booking) {
		BookingResponse response = new BookingResponse();
		response.setId(booking.getId());
		response.setUserId(booking.getUserId());
		response.setEventId(booking.getEventId());
		response.setTotalAmount(booking.getTotalAmount());
		response.setStatus(booking.getStatus());
		response.setBookingTime(booking.getBookingTime());
		response.setReservedUntil(booking.getReservedUntil());
		response.setItems(toItemResponses(booking.getItems()));
		return response;
	}

	private static List<BookingItemResponse> toItemResponses(List<BookingItem> items) {
		return items.stream().map(BookingMapper::toItemResponse).collect(Collectors.toList());
	}

	private static BookingItemResponse toItemResponse(BookingItem item) {
		BookingItemResponse response = new BookingItemResponse();
		response.setId(item.getId());
		response.setTicketCategoryId(item.getTicketCategoryId());
		response.setQuantity(item.getQuantity());
		response.setPrice(item.getPrice());
		return response;
	}

}
