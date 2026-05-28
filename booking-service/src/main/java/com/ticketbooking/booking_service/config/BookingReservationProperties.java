package com.ticketbooking.booking_service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "booking.reservation")
public class BookingReservationProperties {

	/** Thời gian giữ vé chờ thanh toán (phút). */
	private int timeoutMinutes = 5;

	/** Chu kỳ quét đơn RESERVED hết hạn (ms). */
	private long expiryCheckIntervalMs = 30_000;

	public int getTimeoutMinutes() {
		return timeoutMinutes;
	}

	public void setTimeoutMinutes(int timeoutMinutes) {
		this.timeoutMinutes = timeoutMinutes;
	}

	public long getExpiryCheckIntervalMs() {
		return expiryCheckIntervalMs;
	}

	public void setExpiryCheckIntervalMs(long expiryCheckIntervalMs) {
		this.expiryCheckIntervalMs = expiryCheckIntervalMs;
	}

}
