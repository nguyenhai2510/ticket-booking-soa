package com.ticketbooking.user_service.service;

import com.ticketbooking.user_service.dto.CreateUserRequest;
import com.ticketbooking.user_service.dto.LoginRequest;
import com.ticketbooking.user_service.dto.RegisterRequest;
import com.ticketbooking.user_service.dto.UpdateUserRequest;
import com.ticketbooking.user_service.dto.UserResponse;
import com.ticketbooking.user_service.entity.User;
import com.ticketbooking.user_service.exception.DuplicateUserException;
import com.ticketbooking.user_service.exception.UserNotFoundException;
import com.ticketbooking.user_service.repository.UserRepository;

import java.util.List;
import java.util.UUID;
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
			throw new DuplicateUserException("Username da ton tai!");
		}
		if (userRepository.existsByEmail(request.getEmail())) {
			throw new DuplicateUserException("Email da ton tai!");
		}

		User user = new User();
		user.setUsername(request.getUsername());
		user.setPassword(passwordEncoder.encode(request.getPassword()));
		user.setEmail(request.getEmail());
		user.setRole("USER");

		User savedUser = userRepository.save(user);
		return new UserResponse(savedUser);
	}

	@Transactional
	public UserResponse createUser(CreateUserRequest request) {
		if (userRepository.existsByUsername(request.getUsername())) {
			throw new DuplicateUserException("Username da ton tai!");
		}
		if (userRepository.existsByEmail(request.getEmail())) {
			throw new DuplicateUserException("Email da ton tai!");
		}

		User user = new User();
		user.setUsername(request.getUsername());
		user.setPassword(passwordEncoder.encode(request.getPassword()));
		user.setEmail(request.getEmail());
		user.setRole(request.getRole());

		User savedUser = userRepository.save(user);
		return new UserResponse(savedUser);
	}

	public List<UserResponse> getAllUsers() {
		return userRepository.findAll().stream().map(UserResponse::new).toList();
	}

	public UserResponse getUserById(UUID id) {
		User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
		return new UserResponse(user);
	}

	@Transactional
	public UserResponse updateUser(UUID id, UpdateUserRequest request) {
		User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));

		if (request.getUsername() != null && !request.getUsername().isBlank()
				&& !request.getUsername().equals(user.getUsername())) {
			if (userRepository.existsByUsername(request.getUsername())) {
				throw new DuplicateUserException("Username da ton tai!");
			}
			user.setUsername(request.getUsername());
		}

		if (request.getEmail() != null && !request.getEmail().isBlank()
				&& !request.getEmail().equals(user.getEmail())) {
			if (userRepository.existsByEmail(request.getEmail())) {
				throw new DuplicateUserException("Email da ton tai!");
			}
			user.setEmail(request.getEmail());
		}

		if (request.getRole() != null && !request.getRole().isBlank()) {
			user.setRole(request.getRole());
		}

		User savedUser = userRepository.save(user);
		return new UserResponse(savedUser);
	}

	@Transactional
	public void deleteUser(UUID id) {
		if (!userRepository.existsById(id)) {
			throw new UserNotFoundException(id);
		}
		userRepository.deleteById(id);
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
