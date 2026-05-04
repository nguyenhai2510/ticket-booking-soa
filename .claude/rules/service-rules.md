---
name: service-rules
description: Conventions for backend microservices. Loaded ONLY when editing backend service directories.
globs:
  - "*-service/**"
---
# Backend Microservice Rules

## Service Discovery (Eureka)
- The `application.yml` MUST contain the explicit Eureka server URL:
  `eureka.client.service-url.defaultZone: http://localhost:8761/eureka/`
- Every service must have `@EnableDiscoveryClient` (or rely on auto-configuration if using modern Spring Cloud, but the dependency `spring-cloud-starter-netflix-eureka-client` is mandatory).

## Inter-Service Communication
- NEVER hardcode IP addresses or ports (e.g., `http://localhost:8082`).
- Use `RestTemplate` or `WebClient` injected as a Spring Bean.
- The Bean MUST be annotated with `@LoadBalanced`.
- Call services using their Eureka registered name (e.g., `http://EVENT-SERVICE/api/events`).

## Database
- All microservices use PostgreSQL. Ensure `postgresql` driver and `spring-boot-starter-data-jpa` are in `pom.xml`.