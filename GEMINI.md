# Project Instructions (GEMINI.md)

This project follows a strict architectural "harness" defined in the `.claude/` folder. These instructions take absolute precedence over general defaults.

## Core Rules & Conventions
- **Primary Source of Truth:** Always refer to `.claude/CLAUDE.md` for the global architectural layout, ports, and build commands.
- **Scoped Rules:** Before modifying any specific module, read the corresponding rule file in `.claude/rules/`:
  - `frontend/**` -> `.claude/rules/frontend-rules.md`
  - `api-gateway/**` -> `.claude/rules/gateway-rules.md`
  - `*-service/**` -> `.claude/rules/service-rules.md`

## Strategic Mandates
- **Microservices Communication:** MUST use `@LoadBalanced` and Eureka service names (`lb://SERVICE-NAME`).
- **Gateway Routing:** MUST use Java DSL (`RouterFunction`). YAML routing is strictly forbidden.
- **Database:** PostgreSQL is the standard for all backend services.
- **Formatting:** Use `./mvnw spring-javaformat:apply` for Java code formatting.

## Verification Workflow
- After any change, run the build command specified in `CLAUDE.md` for the affected service to ensure structural integrity.
