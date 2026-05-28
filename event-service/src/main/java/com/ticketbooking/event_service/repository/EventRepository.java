// src/main/java/com/ticketbooking/event_service/repository/EventRepository.java
package com.ticketbooking.event_service.repository;

import com.ticketbooking.event_service.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

	@Query("SELECT e FROM Event e LEFT JOIN FETCH e.ticketCategories WHERE e.id = :id")
	Optional<Event> findByIdWithCategories(@Param("id") UUID id);

	@Query("SELECT DISTINCT e FROM Event e LEFT JOIN FETCH e.ticketCategories")
	List<Event> findAllWithCategories();

}