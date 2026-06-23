// src/main/java/com/ticketbooking/event_service/controller/EventController.java
package com.ticketbooking.event_service.controller;

import com.ticketbooking.event_service.entity.Event;
import com.ticketbooking.event_service.service.EventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
public class EventController {

	private final EventService eventService;

	public EventController(EventService eventService) {
		this.eventService = eventService;
	}

	@PostMapping
	public ResponseEntity<Event> createEvent(@RequestBody Event event) {
		Event savedEvent = eventService.createEvent(event);
		return ResponseEntity.status(HttpStatus.CREATED).body(savedEvent);
	}

	@GetMapping
	public ResponseEntity<List<Event>> getAllEvents() {
		return ResponseEntity.ok(eventService.getAllEvents());
	}

	@GetMapping("/{id}")
	public ResponseEntity<Event> getEventById(@PathVariable UUID id) {
		return ResponseEntity.ok(eventService.getEventById(id));
	}

	@PutMapping("/{id}")
	public ResponseEntity<Event> updateEvent(@PathVariable UUID id, @RequestBody Event event) {
		Event updatedEvent = eventService.updateEvent(id, event);
		return ResponseEntity.ok(updatedEvent);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteEvent(@PathVariable UUID id) {
		eventService.deleteEvent(id);
		return ResponseEntity.noContent().build();
	}

}