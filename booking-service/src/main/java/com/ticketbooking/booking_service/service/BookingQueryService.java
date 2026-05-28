package com.ticketbooking.booking_service.service;

import com.ticketbooking.booking_service.dto.BookingResponse;
import com.ticketbooking.booking_service.exception.BookingNotFoundException;
import com.ticketbooking.booking_service.mapper.BookingMapper;
import com.ticketbooking.booking_service.repository.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class BookingQueryService {

	private final BookingRepository bookingRepository;

	private final BookingExpiryService bookingExpiryService;

	public BookingQueryService(BookingRepository bookingRepository, BookingExpiryService bookingExpiryService) {
		this.bookingRepository = bookingRepository;
		this.bookingExpiryService = bookingExpiryService;
	}

	@Transactional
	public BookingResponse getById(UUID bookingId) {
		return bookingRepository.findByIdWithItems(bookingId)
			.map(bookingExpiryService::expireIfDue)
			.map(BookingMapper::toResponse)
			.orElseThrow(() -> new BookingNotFoundException(bookingId));
	}

}
