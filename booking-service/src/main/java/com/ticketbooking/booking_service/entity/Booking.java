package com.ticketbooking.booking_service.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "bookings")
public class Booking {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(name = "user_id", nullable = false)
	private UUID userId;

	@Column(name = "event_id", nullable = false)
	private UUID eventId;

	@Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
	private BigDecimal totalAmount = BigDecimal.ZERO;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 50)
	private BookingStatus status = BookingStatus.PENDING;

	@CreationTimestamp
	@Column(name = "booking_time", nullable = false, updatable = false)
	private Instant bookingTime;

	@Column(name = "reserved_until")
	private Instant reservedUntil;

	@OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<BookingItem> items = new ArrayList<>();

	public Booking() {
	}

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public UUID getUserId() {
		return userId;
	}

	public void setUserId(UUID userId) {
		this.userId = userId;
	}

	public UUID getEventId() {
		return eventId;
	}

	public void setEventId(UUID eventId) {
		this.eventId = eventId;
	}

	public BigDecimal getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(BigDecimal totalAmount) {
		this.totalAmount = totalAmount;
	}

	public BookingStatus getStatus() {
		return status;
	}

	public void setStatus(BookingStatus status) {
		this.status = status;
	}

	public Instant getBookingTime() {
		return bookingTime;
	}

	public void setBookingTime(Instant bookingTime) {
		this.bookingTime = bookingTime;
	}

	public Instant getReservedUntil() {
		return reservedUntil;
	}

	public void setReservedUntil(Instant reservedUntil) {
		this.reservedUntil = reservedUntil;
	}

	public List<BookingItem> getItems() {
		return items;
	}

	public void setItems(List<BookingItem> items) {
		this.items = items;
	}

	public void addItem(BookingItem item) {
		items.add(item);
		item.setBooking(this);
	}

}
