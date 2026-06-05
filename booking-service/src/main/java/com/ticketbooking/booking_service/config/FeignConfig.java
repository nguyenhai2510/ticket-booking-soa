package com.ticketbooking.booking_service.config;

import com.ticketbooking.booking_service.exception.EventNotFoundException;
import com.ticketbooking.booking_service.exception.FeignClientException;
import com.ticketbooking.booking_service.exception.InvalidBookingRequestException;
import com.ticketbooking.booking_service.exception.InventoryConflictException;
import com.ticketbooking.booking_service.exception.UserNotFoundException;
import feign.Response;
import feign.codec.ErrorDecoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {

	@Bean
	public ErrorDecoder feignErrorDecoder() {
		return new BookingFeignErrorDecoder();
	}

	static class BookingFeignErrorDecoder implements ErrorDecoder {

		private final ErrorDecoder defaultDecoder = new Default();

		@Override
		public Exception decode(String methodKey, Response response) {
			int status = response.status();
			if (status == 404) {
				if (methodKey.contains("UserServiceClient")) {
					return new UserNotFoundException("User not found");
				}
				if (methodKey.contains("EventServiceClient")) {
					return new EventNotFoundException("Event not found");
				}
			}
			if (status == 400 && methodKey.contains("EventInventoryClient")) {
				return new InvalidBookingRequestException("Inventory reservation failed");
			}
			if (status == 409 && methodKey.contains("EventInventoryClient")) {
				return new InventoryConflictException("Inventory conflict (optimistic lock). Please retry.");
			}
			if (status >= 400) {
				return new FeignClientException("Remote call failed: " + methodKey + " -> HTTP " + status);
			}
			return defaultDecoder.decode(methodKey, response);
		}

	}

}
