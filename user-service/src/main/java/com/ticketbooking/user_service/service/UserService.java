package com.ticketbooking.user_service.service;

import com.ticketbooking.user_service.dto.LoginRequest;
import com.ticketbooking.user_service.dto.RegisterRequest;
import com.ticketbooking.user_service.dto.UserResponse;
import com.ticketbooking.user_service.entity.User;
import com.ticketbooking.user_service.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

	private final UserRepository userRepository;

	private final PasswordEncoder passwordEncoder;

	public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Transactional
	public UserResponse register(RegisterRequest request) {
		if (userRepository.existsByUsername(request.getUsername())) {
			throw new RuntimeException("Username da ton tai!");
		}
		if (userRepository.existsByEmail(request.getEmail())) {
			throw new RuntimeException("Email da ton tai!");
		}

		User user = new User();
		user.setUsername(request.getUsername());
		user.setPassword(passwordEncoder.encode(request.getPassword()));
		user.setEmail(request.getEmail());
		user.setRole("USER");

		User savedUser = userRepository.save(user);
		return new UserResponse(savedUser);
	}

	public UserResponse login(LoginRequest request) {
		User user = userRepository.findByUsername(request.getUsername())
			.orElseThrow(() -> new RuntimeException("Sai username hoac password!"));

		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new RuntimeException("Sai username hoac password!");
		}

		return new UserResponse(user);
	}

}
