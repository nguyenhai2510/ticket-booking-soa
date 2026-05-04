# ticket-booking-soa
Microservices architecture for ticket booking. Built with Spring Boot 4.0.6, Spring Cloud 2025.1.1, and Java 17.

## Layout & Architecture
- `eureka-server/`: Port 8761 (Service Registry)
- `api-gateway/`: Port 8080 (Entry point, Spring Cloud Gateway MVC)
- `event-service/`: Port 8082 (PostgreSQL: `db_event`)
- `booking-service/`: Port 8083 (PostgreSQL: `db_booking`)
- `user-service/`: Port to be assigned, likely 8081 (PostgreSQL: `db_user`)
- `frontend/`: React/UI client
- `init-scripts/`: DevOps and database initialization scripts

## Build & Run Commands
- Build service: `cd <service-name> && ./mvnw clean package -DskipTests`
- Run service:   `cd <service-name> && ./mvnw spring-boot:run`
- Format code:   `cd <service-name> && ./mvnw spring-javaformat:apply`

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