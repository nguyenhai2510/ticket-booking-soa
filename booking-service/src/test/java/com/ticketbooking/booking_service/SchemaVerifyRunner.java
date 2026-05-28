package com.ticketbooking.booking_service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;

/** Lists bookings columns in db_booking for debug verification. */
public class SchemaVerifyRunner {

	public static void main(String[] args) throws Exception {
		String url = "jdbc:postgresql://localhost:5432/db_booking";
		try (Connection connection = DriverManager.getConnection(url, "postgres", "123456");
				var statement = connection.createStatement();
				ResultSet rs = statement.executeQuery("""
						SELECT column_name, data_type, udt_name
						FROM information_schema.columns
						WHERE table_schema = 'public' AND table_name = 'bookings'
						ORDER BY ordinal_position
						""")) {
			System.out.println("bookings columns:");
			while (rs.next()) {
				System.out.printf("  %s %s (%s)%n", rs.getString(1), rs.getString(2), rs.getString(3));
			}
		}
		try (Connection connection = DriverManager.getConnection(url, "postgres", "123456");
				var statement = connection.createStatement();
				ResultSet rs = statement.executeQuery("""
						SELECT column_name, data_type, udt_name
						FROM information_schema.columns
						WHERE table_schema = 'public' AND table_name = 'booking_items'
						ORDER BY ordinal_position
						""")) {
			System.out.println("booking_items columns:");
			while (rs.next()) {
				System.out.printf("  %s %s (%s)%n", rs.getString(1), rs.getString(2), rs.getString(3));
			}
		}
	}

}
