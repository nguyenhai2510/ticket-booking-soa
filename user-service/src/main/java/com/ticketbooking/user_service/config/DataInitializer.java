package com.ticketbooking.user_service.config;

import com.ticketbooking.user_service.entity.User;
import com.ticketbooking.user_service.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void run(String... args) throws Exception {
		if (!userRepository.existsByUsername("admin")) {
			User admin = new User();
			admin.setUsername("admin");
			admin.setEmail("admin@eventpass.com");
			admin.setPassword(passwordEncoder.encode("admin123"));
			admin.setRole("ADMIN");
			userRepository.save(admin);
			System.out.println("Default admin user created: admin / admin123");
		}
	}
}
