// src/main/java/com/ticketbooking/event_service/service/EventService.java
package com.ticketbooking.event_service.service;

import com.ticketbooking.event_service.entity.Event;
import com.ticketbooking.event_service.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class EventService {

    private final EventRepository eventRepository;

    // Thay thế @RequiredArgsConstructor của Lombok bằng Constructor thuần
    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event createEvent(Event event) {
        // Mặc định số vé còn lại bằng tổng số vé lúc mới tạo
        event.setAvailableTickets(event.getTotalTickets());
        return eventRepository.save(event);
    }

    // Hàm quan trọng nhất: Xử lý trừ vé có dùng Transaction
    @Transactional
    public void deductTicket(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện!"));

        if (event.getAvailableTickets() <= 0) {
            throw new RuntimeException("Sự kiện đã hết vé!");
        }

        // Trừ đi 1 vé
        event.setAvailableTickets(event.getAvailableTickets() - 1);
        
        // Lưu lại (Spring Data JPA sẽ tự động tăng cột version lên 1 để khóa Optimistic Locking)
        eventRepository.save(event);
    }
}