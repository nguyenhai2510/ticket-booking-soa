package com.ticketbooking.booking_service.client;

import com.ticketbooking.booking_service.client.dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "user-service")
public interface UserServiceClient {

	@GetMapping("/api/users/{id}")
	UserDto getUser(@PathVariable("id") UUID id);

}
