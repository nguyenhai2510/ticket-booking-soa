package com.ticketbooking.booking_service.saga;

import com.ticketbooking.booking_service.client.EventInventoryClient;
import com.ticketbooking.booking_service.client.EventServiceClient;
import com.ticketbooking.booking_service.client.UserServiceClient;
import com.ticketbooking.booking_service.client.dto.EventDetailDto;
import com.ticketbooking.booking_service.dto.BookingResponse;
import com.ticketbooking.booking_service.dto.ConfirmPaymentRequest;
import com.ticketbooking.booking_service.dto.CreateBookingRequest;
import com.ticketbooking.booking_service.entity.Booking;
import com.ticketbooking.booking_service.entity.BookingStatus;
import com.ticketbooking.booking_service.exception.BookingExpiredException;
import com.ticketbooking.booking_service.exception.BookingNotFoundException;
import com.ticketbooking.booking_service.exception.InvalidBookingStateException;
import com.ticketbooking.booking_service.service.BookingExpiryService;
import com.ticketbooking.booking_service.mapper.BookingMapper;
import com.ticketbooking.booking_service.repository.BookingRepository;
import com.ticketbooking.booking_service.service.BookingValidationService;
import com.ticketbooking.booking_service.service.BookingValidationService.ValidatedLine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class BookingSagaOrchestrator {

	private static final Logger log = LoggerFactory.getLogger(BookingSagaOrchestrator.class);

	private final BookingRepository bookingRepository;

	private final SagaBookingStore sagaBookingStore;

	private final UserServiceClient userServiceClient;

	private final EventServiceClient eventServiceClient;

	private final EventInventoryClient eventInventoryClient;

	private final BookingValidationService bookingValidationService;

	private final BookingExpiryService bookingExpiryService;

	public BookingSagaOrchestrator(BookingRepository bookingRepository, SagaBookingStore sagaBookingStore,
			UserServiceClient userServiceClient, EventServiceClient eventServiceClient,
			EventInventoryClient eventInventoryClient, BookingValidationService bookingValidationService,
			BookingExpiryService bookingExpiryService) {
		this.bookingRepository = bookingRepository;
		this.sagaBookingStore = sagaBookingStore;
		this.userServiceClient = userServiceClient;
		this.eventServiceClient = eventServiceClient;
		this.eventInventoryClient = eventInventoryClient;
		this.bookingValidationService = bookingValidationService;
		this.bookingExpiryService = bookingExpiryService;
	}

	/**
	 * SAGA phase 1: validate → persist PENDING → reserve inventory → RESERVED (or
	 * FAILED).
	 */
	public BookingResponse startBooking(CreateBookingRequest request) {
		userServiceClient.getUser(request.getUserId());
		EventDetailDto event = eventServiceClient.getEvent(request.getEventId());
		BookingValidationService.ValidatedBooking validated = bookingValidationService.validateAgainstEvent(request,
				event);

		Booking saved = sagaBookingStore.createPending(request.getUserId(), request.getEventId(),
				validated.totalAmount(), validated.lines());

		List<ValidatedLine> lines = validated.lines();
		try {
			eventInventoryClient.reserve(InventoryRequestMapper.fromValidated(saved.getId(), lines));
			return sagaBookingStore.markReserved(saved.getId());
		}
		catch (Exception ex) {
			log.warn("SAGA reserve failed for booking {}: {}", saved.getId(), ex.getMessage(), ex);
			sagaBookingStore.markStatus(saved.getId(), BookingStatus.FAILED);
			throw ex;
		}
	}

	@Transactional
	public BookingResponse confirmPayment(UUID bookingId, ConfirmPaymentRequest request) {
		Booking booking = requireReservedBooking(loadBookingWithItems(bookingId), bookingId, "confirm payment");

		if (request != null && request.isSimulateFailure()) {
			compensateInventory(booking);
			booking.setStatus(BookingStatus.CANCELLED);
		}
		else {
			booking.setStatus(BookingStatus.CONFIRMED);
		}

		return BookingMapper.toResponse(bookingRepository.save(booking));
	}

	@Transactional
	public BookingResponse cancelBooking(UUID bookingId) {
		Booking booking = requireReservedBooking(loadBookingWithItems(bookingId), bookingId, "cancel");

		compensateInventory(booking);
		booking.setStatus(BookingStatus.CANCELLED);
		return BookingMapper.toResponse(bookingRepository.save(booking));
	}

	private Booking loadBookingWithItems(UUID bookingId) {
		return bookingRepository.findByIdWithItems(bookingId)
			.orElseThrow(() -> new BookingNotFoundException(bookingId));
	}

	private Booking requireReservedBooking(Booking booking, UUID bookingId, String action) {
		booking = bookingExpiryService.expireIfDue(booking);
		if (booking.getStatus() == BookingStatus.RESERVED) {
			return booking;
		}
		if (booking.getReservedUntil() != null) {
			throw new BookingExpiredException(bookingId);
		}
		throw new InvalidBookingStateException(booking.getStatus(), action);
	}

	private void compensateInventory(Booking booking) {
		sagaBookingStore.markStatus(booking.getId(), BookingStatus.COMPENSATING);
		eventInventoryClient.release(InventoryRequestMapper.fromBooking(booking));
	}

}
