---
name: gateway-rules
description: Conventions for the api-gateway. Loaded ONLY when editing or planning changes inside the api-gateway directory.
globs:
  - "api-gateway/**"
---
# API Gateway Rules (Spring Cloud Gateway MVC 2025.x)

## Routing Configuration (CRITICAL)
- NEVER use YAML (`spring.cloud.gateway.routes`) for routing. It is ignored by the MVC version.
- ALL routes MUST be configured using Java DSL `RouterFunction` beans.
- When proxying requests to other services, you MUST use `LoadBalancerFilterFunctions.lb("service-name")` to resolve the URI from Eureka.
- Example pattern:
  `GatewayRouterFunctions.route("route-id").route(path("/api/prefix/**"), HandlerFunctions.http()).filter(LoadBalancerFilterFunctions.lb("SERVICE-NAME")).build();`

## Dependencies
- NEVER add `spring-boot-starter-webflux` or Netty-based dependencies. This gateway uses Tomcat/MVC.