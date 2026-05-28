package com.ticketbooking.user_service.controller;

import com.ticketbooking.user_service.dto.LoginRequest;
import com.ticketbooking.user_service.dto.RegisterRequest;
import com.ticketbooking.user_service.dto.UserResponse;
import com.ticketbooking.user_service.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping("/{id}")
	public ResponseEntity<UserResponse> getUser(@PathVariable UUID id) {
		UserResponse response = userService.getUserById(id);
		return ResponseEntity.ok(response);
	}

	@PostMapping("/register")
	public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
		UserResponse response = userService.register(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@PostMapping("/login")
	public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest request) {
		UserResponse response = userService.login(request);
		return ResponseEntity.ok(response);
	}

}
