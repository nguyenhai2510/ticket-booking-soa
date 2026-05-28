package com.ticketbooking.event_service.controller;

import com.ticketbooking.event_service.dto.InventoryRequest;
import com.ticketbooking.event_service.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

	private final InventoryService inventoryService;

	public InventoryController(InventoryService inventoryService) {
		this.inventoryService = inventoryService;
	}

	@PostMapping("/reserve")
	public ResponseEntity<Void> reserve(@RequestBody InventoryRequest request) {
		inventoryService.reserve(request);
		return ResponseEntity.ok().build();
	}

	@PostMapping("/release")
	public ResponseEntity<Void> release(@RequestBody InventoryRequest request) {
		inventoryService.release(request);
		return ResponseEntity.ok().build();
	}

}
