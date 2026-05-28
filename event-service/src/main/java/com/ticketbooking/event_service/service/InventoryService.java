package com.ticketbooking.event_service.service;

import com.ticketbooking.event_service.dto.InventoryItemRequest;
import com.ticketbooking.event_service.dto.InventoryRequest;
import com.ticketbooking.event_service.entity.TicketCategory;
import com.ticketbooking.event_service.exception.InsufficientInventoryException;
import com.ticketbooking.event_service.exception.TicketCategoryNotFoundException;
import com.ticketbooking.event_service.repository.TicketCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class InventoryService {

	private final TicketCategoryRepository ticketCategoryRepository;

	public InventoryService(TicketCategoryRepository ticketCategoryRepository) {
		this.ticketCategoryRepository = ticketCategoryRepository;
	}

	@Transactional
	public void reserve(InventoryRequest request) {
		validateRequest(request);
		for (InventoryItemRequest item : request.getItems()) {
			TicketCategory category = loadCategory(item.getTicketCategoryId());
			int available = category.getAvailableQuantity();
			int quantity = item.getQuantity();
			if (available < quantity) {
				throw new InsufficientInventoryException(
						"Not enough tickets for category: " + category.getName());
			}
			category.setAvailableQuantity(available - quantity);
			ticketCategoryRepository.save(category);
		}
	}

	@Transactional
	public void release(InventoryRequest request) {
		validateRequest(request);
		for (InventoryItemRequest item : request.getItems()) {
			TicketCategory category = loadCategory(item.getTicketCategoryId());
			int restored = category.getAvailableQuantity() + item.getQuantity();
			int capped = Math.min(category.getTotalQuantity(), restored);
			category.setAvailableQuantity(capped);
			ticketCategoryRepository.save(category);
		}
	}

	private TicketCategory loadCategory(UUID categoryId) {
		return ticketCategoryRepository.findById(categoryId)
			.orElseThrow(() -> new TicketCategoryNotFoundException(categoryId));
	}

	private void validateRequest(InventoryRequest request) {
		if (request.getBookingId() == null) {
			throw new IllegalArgumentException("bookingId is required");
		}
		if (request.getItems() == null || request.getItems().isEmpty()) {
			throw new IllegalArgumentException("items must not be empty");
		}
		for (InventoryItemRequest item : request.getItems()) {
			if (item.getTicketCategoryId() == null || item.getQuantity() == null || item.getQuantity() < 1) {
				throw new IllegalArgumentException("Each item requires ticketCategoryId and quantity >= 1");
			}
		}
	}

}
