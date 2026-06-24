package com.ticketbooking.booking_service.repository;

import com.ticketbooking.booking_service.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

	@Query("SELECT b FROM Booking b LEFT JOIN FETCH b.items WHERE b.id = :id")
	Optional<Booking> findByIdWithItems(@Param("id") UUID id);

	@Query("""
			SELECT b FROM Booking b LEFT JOIN FETCH b.items
			WHERE b.status = com.ticketbooking.booking_service.entity.BookingStatus.RESERVED
			  AND b.reservedUntil IS NOT NULL AND b.reservedUntil < :now
			""")
	List<Booking> findExpiredReservations(@Param("now") Instant now);

}