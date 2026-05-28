package com.ticketbooking.booking_service.service;

import com.ticketbooking.booking_service.client.EventInventoryClient;
import com.ticketbooking.booking_service.entity.Booking;
import com.ticketbooking.booking_service.entity.BookingStatus;
import com.ticketbooking.booking_service.repository.BookingRepository;
import com.ticketbooking.booking_service.saga.InventoryRequestMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingExpiryService {

	private static final Logger log = LoggerFactory.getLogger(BookingExpiryService.class);

	private final BookingRepository bookingRepository;

	private final EventInventoryClient eventInventoryClient;

	public BookingExpiryService(BookingRepository bookingRepository, EventInventoryClient eventInventoryClient) {
		this.bookingRepository = bookingRepository;
		this.eventInventoryClient = eventInventoryClient;
	}

	public boolean isExpired(Booking booking) {
		return booking.getStatus() == BookingStatus.RESERVED && booking.getReservedUntil() != null
				&& LocalDateTime.now().isAfter(booking.getReservedUntil());
	}

	@Transactional
	public Booking expireIfDue(Booking booking) {
		if (!isExpired(booking)) {
			return booking;
		}
		return expireReservation(booking);
	}

	@Transactional
	public int expireAllDue() {
		List<Booking> expired = bookingRepository.findExpiredReservations(LocalDateTime.now());
		for (Booking booking : expired) {
			expireReservation(booking);
		}
		if (!expired.isEmpty()) {
			log.info("Auto-expired {} reserved booking(s)", expired.size());
		}
		return expired.size();
	}

	@Transactional
	public Booking expireReservation(Booking booking) {
		if (booking.getStatus() != BookingStatus.RESERVED) {
			return booking;
		}
		log.info("Expiring reservation for booking {}", booking.getId());
		booking.setStatus(BookingStatus.COMPENSATING);
		bookingRepository.save(booking);
		eventInventoryClient.release(InventoryRequestMapper.fromBooking(booking));
		booking.setStatus(BookingStatus.CANCELLED);
		return bookingRepository.save(booking);
	}

}
