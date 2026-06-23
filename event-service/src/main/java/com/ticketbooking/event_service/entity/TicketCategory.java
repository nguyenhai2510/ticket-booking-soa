// src/main/java/com/ticketbooking/event_service/entity/TicketCategory.java
package com.ticketbooking.event_service.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "ticket_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "event")
@EqualsAndHashCode(exclude = "event")
public class TicketCategory {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(nullable = false)
	private String name;

	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal price;

	@Column(nullable = false)
	private Integer totalQuantity;

	@Column(nullable = false)
	private Integer availableQuantity;

	@Version
	@Column(nullable = false)
	private Integer version = 0;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "event_id", nullable = false)
	@JsonBackReference
	private Event event;

}
