package com.ticketbooking.booking_service.client.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class EventDetailDto {

	private UUID id;

	private String title;

	private String description;

	private String location;

	private LocalDateTime eventDate;

	private String imageUrl;

	private List<TicketCategoryDto> ticketCategories = new ArrayList<>();

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public LocalDateTime getEventDate() {
		return eventDate;
	}

	public void setEventDate(LocalDateTime eventDate) {
		this.eventDate = eventDate;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public List<TicketCategoryDto> getTicketCategories() {
		return ticketCategories;
	}

	public void setTicketCategories(List<TicketCategoryDto> ticketCategories) {
		this.ticketCategories = ticketCategories;
	}

}
