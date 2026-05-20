// src/main/java/com/ticketbooking/event_service/service/EventService.java
package com.ticketbooking.event_service.service;

import com.ticketbooking.event_service.entity.Event;

import java.util.List;
import java.util.UUID;

public interface EventService {

    Event createEvent(Event event);

    List<Event> getAllEvents();

    Event getEventById(UUID id);
}
