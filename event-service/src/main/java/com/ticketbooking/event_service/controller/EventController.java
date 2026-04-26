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

    // 1. API Lấy danh sách sự kiện
    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    // 2. API Tạo sự kiện mới
    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        Event savedEvent = eventService.createEvent(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedEvent);
    }

    // 3. API nội bộ để trừ vé (Booking Service sẽ gọi API này)
    @PostMapping("/{id}/deduct")
    public ResponseEntity<String> deductTicket(@PathVariable UUID id) {
        try {
            eventService.deductTicket(id);
            return ResponseEntity.ok("Trừ vé thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}