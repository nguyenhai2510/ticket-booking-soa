package com.ticketbooking.event_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.persistence.OptimisticLockException;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler({ OptimisticLockException.class, ObjectOptimisticLockingFailureException.class })
	public ResponseEntity<Map<String, String>> handleOptimisticLock(Exception ex) {
		return ResponseEntity.status(HttpStatus.CONFLICT)
			.body(Map.of("message", "Inventory conflict (optimistic lock). Please retry."));
	}

	@ExceptionHandler(InsufficientInventoryException.class)
	public ResponseEntity<Map<String, String>> handleInsufficient(InsufficientInventoryException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
	}

	@ExceptionHandler(TicketCategoryNotFoundException.class)
	public ResponseEntity<Map<String, String>> handleNotFound(TicketCategoryNotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
	}

}
