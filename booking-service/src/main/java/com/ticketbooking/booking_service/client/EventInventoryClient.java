package com.ticketbooking.booking_service.client;

import com.ticketbooking.booking_service.client.dto.InventoryRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Internal inventory API on event-service (Task 3a). Client wired in Task 2.
 */
@FeignClient(name = "event-service", contextId = "eventInventoryClient")
public interface EventInventoryClient {

	@PostMapping("/api/inventory/reserve")
	void reserve(@RequestBody InventoryRequest request);

	@PostMapping("/api/inventory/release")
	void release(@RequestBody InventoryRequest request);

}
