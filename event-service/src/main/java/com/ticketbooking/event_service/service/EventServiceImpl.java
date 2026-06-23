// src/main/java/com/ticketbooking/event_service/service/EventServiceImpl.java
package com.ticketbooking.event_service.service;

import com.ticketbooking.event_service.entity.Event;
import com.ticketbooking.event_service.entity.TicketCategory;
import com.ticketbooking.event_service.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class EventServiceImpl implements EventService {

	private final EventRepository eventRepository;

	public EventServiceImpl(EventRepository eventRepository) {
		this.eventRepository = eventRepository;
	}

	@Override
	@Transactional
	public Event createEvent(Event event) {
		// CRITICAL: Set ngược quan hệ event vào từng ticketCategory để foreign key không
		// bị null
		if (event.getTicketCategories() != null && !event.getTicketCategories().isEmpty()) {
			for (TicketCategory ticketCategory : event.getTicketCategories()) {
				ticketCategory.setEvent(event);
				if (ticketCategory.getAvailableQuantity() == null && ticketCategory.getTotalQuantity() != null) {
					ticketCategory.setAvailableQuantity(ticketCategory.getTotalQuantity());
				}
			}
		}
		return eventRepository.save(event);
	}

	@Override
	@Transactional(readOnly = true)
	public List<Event> getAllEvents() {
		return eventRepository.findAllWithCategories();
	}

	@Override
	@Transactional(readOnly = true)
	public Event getEventById(UUID id) {
		return eventRepository.findByIdWithCategories(id)
			.orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
	}

	@Override
	@Transactional
	public Event updateEvent(UUID id, Event updatedEvent) {
		Event existingEvent = eventRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
		existingEvent.setTitle(updatedEvent.getTitle());
		existingEvent.setDescription(updatedEvent.getDescription());
		existingEvent.setLocation(updatedEvent.getLocation());
		existingEvent.setEventDate(updatedEvent.getEventDate());
		existingEvent.setImageUrl(updatedEvent.getImageUrl());
		return eventRepository.save(existingEvent);
	}

	@Override
	@Transactional
	public void deleteEvent(UUID id) {
		if (!eventRepository.existsById(id)) {
			throw new RuntimeException("Event not found with id: " + id);
		}
		eventRepository.deleteById(id);
	}

}
