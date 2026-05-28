package com.ticketbooking.booking_service.dto;

public class ConfirmPaymentRequest {

	private String paymentMethod = "MOCK";

	/** For testing SAGA compensate path when mock payment fails. */
	private boolean simulateFailure = false;

	public String getPaymentMethod() {
		return paymentMethod;
	}

	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}

	public boolean isSimulateFailure() {
		return simulateFailure;
	}

	public void setSimulateFailure(boolean simulateFailure) {
		this.simulateFailure = simulateFailure;
	}

}
