package com.ticketbooking.booking_service.service;

import com.ticketbooking.booking_service.client.dto.EventDetailDto;
import com.ticketbooking.booking_service.client.dto.TicketCategoryDto;
import com.ticketbooking.booking_service.dto.CreateBookingItemRequest;
import com.ticketbooking.booking_service.dto.CreateBookingRequest;
import com.ticketbooking.booking_service.exception.InvalidBookingRequestException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class BookingValidationService {

	public record ValidatedLine(UUID ticketCategoryId, int quantity, BigDecimal unitPrice) {
	}

	public record ValidatedBooking(List<ValidatedLine> lines, BigDecimal totalAmount) {
	}

	public ValidatedBooking validateAgainstEvent(CreateBookingRequest request, EventDetailDto event) {
		if (!event.getId().equals(request.getEventId())) {
			throw new InvalidBookingRequestException("Event id mismatch");
		}

		Map<UUID, TicketCategoryDto> categoriesById = new HashMap<>();
		if (event.getTicketCategories() != null) {
			for (TicketCategoryDto category : event.getTicketCategories()) {
				categoriesById.put(category.getId(), category);
			}
		}

		BigDecimal total = BigDecimal.ZERO;
		List<ValidatedLine> lines = request.getItems().stream().map(item -> {
			TicketCategoryDto category = categoriesById.get(item.getTicketCategoryId());
			if (category == null) {
				throw new InvalidBookingRequestException(
						"Ticket category " + item.getTicketCategoryId() + " does not belong to this event");
			}
			if (category.getAvailableQuantity() == null || category.getAvailableQuantity() < item.getQuantity()) {
				throw new InvalidBookingRequestException("Not enough tickets for category: " + category.getName());
			}
			if (category.getPrice() == null) {
				throw new InvalidBookingRequestException("Category price is missing: " + category.getName());
			}
			return new ValidatedLine(item.getTicketCategoryId(), item.getQuantity(), category.getPrice());
		}).toList();

		for (ValidatedLine line : lines) {
			total = total.add(line.unitPrice().multiply(BigDecimal.valueOf(line.quantity())));
		}

		return new ValidatedBooking(lines, total);
	}

}
