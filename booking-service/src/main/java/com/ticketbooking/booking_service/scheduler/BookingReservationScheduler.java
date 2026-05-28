package com.ticketbooking.booking_service.scheduler;

import com.ticketbooking.booking_service.service.BookingExpiryService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class BookingReservationScheduler {

	private final BookingExpiryService bookingExpiryService;

	public BookingReservationScheduler(BookingExpiryService bookingExpiryService) {
		this.bookingExpiryService = bookingExpiryService;
	}

	@Scheduled(fixedDelayString = "${booking.reservation.expiry-check-interval-ms:30000}")
	public void expireStaleReservations() {
		bookingExpiryService.expireAllDue();
	}

}
