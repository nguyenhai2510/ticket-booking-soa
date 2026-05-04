---
name: new-spring-service
description: Generates a new Spring Boot microservice scaffold, including pom.xml dependencies and base application.yml, then registers it with Eureka.
allowed-tools: Bash, Read, Write, Edit
---
# Skill: new-spring-service

## When to use
Trigger this skill when the user asks to "tạo service mới", "create a new microservice", or specifically mentions generating a Spring Boot service.

## Steps
1. Ask the user for two inputs if not already provided:
   - `SERVICE_NAME` (e.g., user-service)
   - `PORT` (e.g., 8081)
2. Run the generation script:
   `bash .claude/skills/new-spring-service/create.sh <SERVICE_NAME>`
3. Wait for the script to finish downloading and extracting the code.
4. Edit the `<SERVICE_NAME>/src/main/resources/application.properties` file:
   - Rename it to `application.yml`.
   - Add the standard Microservice configuration:
     ```yaml
     server:
       port: <PORT>
     spring:
       application:
         name: <SERVICE_NAME>
     eureka:
       client:
         service-url:
           defaultZone: http://localhost:8761/eureka/
     ```
5. Report to the user that the service is ready and tell them to run `./mvnw clean package` to verify.