# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# ticket-booking-soa

Microservices architecture for ticket booking. Built with Spring Boot 4.0.6, Spring Cloud 2025.1.1, and Java 17.

## Layout & Architecture

- `eureka-server/`: Port 8761 (Service Registry)
- `api-gateway/`: Port 8080 (Entry point, Spring Cloud Gateway MVC)
- `event-service/`: Port 8082 (PostgreSQL: `db_event`)
- `booking-service/`: Port 8083 (PostgreSQL: `db_booking`)
- `user-service/`: Port 8081 (PostgreSQL: `db_user`)
- `frontend/`: React + Vite client
- `init-scripts/`: DevOps and database initialization scripts

Gateway routing is configured in `api-gateway/src/main/java/com/ticketbooking/api_gateway/config/GatewayConfig.java` using Java DSL `RouterFunction` beans. Each route uses `LoadBalancerFilterFunctions.lb()` to resolve service names via Eureka.

Typical service package structure:

```
src/main/java/com/ticketbooking/<service-name>/
├── <ServiceName>Application.java
├── config/
├── controller/
├── entity/
├── repository/
└── service/
```

## Build & Run Commands

### Backend Services

- Build service: `cd <service-name> && ./mvnw clean package -DskipTests`
- Run service:   `cd <service-name> && ./mvnw spring-boot:run`
- Format code:   `cd <service-name> && ./mvnw spring-javaformat:apply`
- Run tests:     `cd <service-name> && ./mvnw test`

**Startup order:** Start `eureka-server` first, wait 30 seconds, then start other services in any order.

### Frontend

- Install dependencies: `cd frontend && npm install`
- Dev server: `cd frontend && npm run dev` (with hot reload)
- Build for production: `cd frontend && npm run build`
- Lint: `cd frontend && npm run lint`

### Database Setup

All services require PostgreSQL running on `localhost:5432` with:

- Databases: `db_event`, `db_booking`, `db_user`
- User: `postgres` / Password: `123456` (configured in each service's `application.yml`)
- Services use `spring.jpa.hibernate.ddl-auto=update` to auto-create tables

## Canonical Conventions (Global Rules)

- ALL inter-service HTTP communication MUST use `@LoadBalanced RestTemplate` or `WebClient`. Never hardcode localhost ports for service-to-service calls.
- Resolve target services via Eureka using `lb://SERVICE-NAME` or `http://SERVICE-NAME`.
- Every microservice MUST register with Eureka. The `application.yml` MUST contain: `eureka.client.service-url.defaultZone=http://localhost:8761/eureka/`
- API Gateway MUST use Java DSL (`RouterFunction`) for routing. DO NOT use YAML-based `spring.cloud.gateway.routes` configuration.

## Guardrails (Claude: follow these literally)

- DO NOT invent or hallucinate new ports. Stick to the Layout list above.
- If a change touches a specific service, read its local rule file in `.claude/rules/` before planning or writing code.
- Never write database configuration credentials in plain text outside of `application.yml` or `.env` files.
- Prefer editing existing configuration over creating redundant beans.

