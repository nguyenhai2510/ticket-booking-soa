package com.ticketbooking.booking_service.client;

import com.ticketbooking.booking_service.client.dto.EventDetailDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "event-service")
public interface EventServiceClient {

	@GetMapping("/api/events/{id}")
	EventDetailDto getEvent(@PathVariable("id") UUID id);

}
