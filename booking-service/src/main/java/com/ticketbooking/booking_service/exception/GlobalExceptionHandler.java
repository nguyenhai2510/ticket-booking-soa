package com.ticketbooking.booking_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(BookingNotFoundException.class)
	public ResponseEntity<Map<String, String>> handleNotFound(BookingNotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error(ex.getMessage()));
	}

	@ExceptionHandler({ UserNotFoundException.class, EventNotFoundException.class })
	public ResponseEntity<Map<String, String>> handleRemoteNotFound(RuntimeException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error(ex.getMessage()));
	}

	@ExceptionHandler(InvalidBookingRequestException.class)
	public ResponseEntity<Map<String, String>> handleBadRequest(InvalidBookingRequestException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error(ex.getMessage()));
	}

	@ExceptionHandler(InventoryConflictException.class)
	public ResponseEntity<Map<String, String>> handleInventoryConflict(InventoryConflictException ex) {
		return ResponseEntity.status(HttpStatus.CONFLICT).body(error(ex.getMessage()));
	}

	@ExceptionHandler(InvalidBookingStateException.class)
	public ResponseEntity<Map<String, String>> handleInvalidState(InvalidBookingStateException ex) {
		return ResponseEntity.status(HttpStatus.CONFLICT).body(error(ex.getMessage()));
	}

	@ExceptionHandler(BookingExpiredException.class)
	public ResponseEntity<Map<String, String>> handleExpired(BookingExpiredException ex) {
		return ResponseEntity.status(HttpStatus.GONE)
			.body(error("Thời gian giữ vé đã hết. Đơn đã được hủy tự động."));
	}

	@ExceptionHandler(SagaStepNotReadyException.class)
	public ResponseEntity<Map<String, String>> handleSagaNotReady(SagaStepNotReadyException ex) {
		return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error(ex.getMessage()));
	}

	@ExceptionHandler(FeignClientException.class)
	public ResponseEntity<Map<String, String>> handleFeign(FeignClientException ex) {
		return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(error(ex.getMessage()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
		String message = ex.getBindingResult().getFieldErrors().stream()
			.findFirst()
			.map(err -> err.getField() + ": " + err.getDefaultMessage())
			.orElse("Validation failed");
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error(message));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, String>> handleGeneric(Exception ex) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
			.body(error(ex.getMessage() != null ? ex.getMessage() : "Internal server error"));
	}

	private static Map<String, String> error(String message) {
		Map<String, String> body = new HashMap<>();
		body.put("message", message);
		return body;
	}

}
