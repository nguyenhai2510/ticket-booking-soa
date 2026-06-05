package com.ticketbooking.booking_service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

/**
 * One-off dev helper: applies migrate-schema.sql to db_booking. Run: ./mvnw -q
 * test-compile exec:java -Dexec.classpathScope=test
 * -Dexec.mainClass=com.ticketbooking.booking_service.SchemaMigrationRunner
 */
public class SchemaMigrationRunner {

	public static void main(String[] args) throws Exception {
		Path sqlPath = Path.of("migrate-schema.sql");
		if (!Files.exists(sqlPath)) {
			throw new IllegalStateException("Missing migrate-schema.sql in booking-service directory");
		}

		String sql = Files.readString(sqlPath);
		String cleaned = sql.lines()
			.filter(line -> !line.trim().startsWith("--"))
			.reduce("", (acc, line) -> acc + line + "\n");

		String url = "jdbc:postgresql://localhost:5432/db_booking";
		String user = "postgres";
		String password = "123456";

		try (Connection connection = DriverManager.getConnection(url, user, password);
				Statement statement = connection.createStatement()) {
			for (String chunk : cleaned.split(";")) {
				String trimmed = chunk.trim();
				if (!trimmed.isEmpty()) {
					statement.execute(trimmed);
				}
			}
		}

		System.out.println("db_booking schema migration completed.");
	}

}
