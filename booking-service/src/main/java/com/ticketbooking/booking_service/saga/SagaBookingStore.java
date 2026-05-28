package com.ticketbooking.booking_service.saga;

import com.ticketbooking.booking_service.config.BookingReservationProperties;
import com.ticketbooking.booking_service.dto.BookingResponse;
import com.ticketbooking.booking_service.entity.Booking;
import com.ticketbooking.booking_service.entity.BookingItem;
import com.ticketbooking.booking_service.entity.BookingStatus;
import com.ticketbooking.booking_service.exception.BookingNotFoundException;
import com.ticketbooking.booking_service.mapper.BookingMapper;
import com.ticketbooking.booking_service.repository.BookingRepository;
import com.ticketbooking.booking_service.service.BookingValidationService.ValidatedLine;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Persists saga state in independent transactions so FAILED/COMPENSATING survive rollback
 * of the orchestrating call when Feign steps fail.
 */
@Service
public class SagaBookingStore {

	private final BookingRepository bookingRepository;

	private final BookingReservationProperties reservationProperties;

	public SagaBookingStore(BookingRepository bookingRepository,
			BookingReservationProperties reservationProperties) {
		this.bookingRepository = bookingRepository;
		this.reservationProperties = reservationProperties;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public Booking createPending(UUID userId, UUID eventId, BigDecimal totalAmount, List<ValidatedLine> lines) {
		Booking booking = new Booking();
		booking.setUserId(userId);
		booking.setEventId(eventId);
		booking.setStatus(BookingStatus.PENDING);
		booking.setTotalAmount(totalAmount);

		for (ValidatedLine line : lines) {
			BookingItem item = new BookingItem();
			item.setTicketCategoryId(line.ticketCategoryId());
			item.setQuantity(line.quantity());
			item.setPrice(line.unitPrice());
			booking.addItem(item);
		}

		return bookingRepository.save(booking);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public BookingResponse markStatus(UUID bookingId, BookingStatus status) {
		Booking booking = bookingRepository.findById(bookingId)
			.orElseThrow(() -> new BookingNotFoundException(bookingId));
		booking.setStatus(status);
		if (status != BookingStatus.RESERVED) {
			booking.setReservedUntil(null);
		}
		return BookingMapper.toResponse(bookingRepository.save(booking));
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public BookingResponse markReserved(UUID bookingId) {
		Booking booking = bookingRepository.findById(bookingId)
			.orElseThrow(() -> new BookingNotFoundException(bookingId));
		booking.setStatus(BookingStatus.RESERVED);
		booking.setReservedUntil(LocalDateTime.now().plusMinutes(reservationProperties.getTimeoutMinutes()));
		return BookingMapper.toResponse(bookingRepository.save(booking));
	}

}
