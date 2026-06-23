package com.ticketbooking.event_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	@Bean
	public org.springframework.web.filter.OncePerRequestFilter trailingSlashRedirectFilter() {
		return new org.springframework.web.filter.OncePerRequestFilter() {
			@Override
			protected void doFilterInternal(jakarta.servlet.http.HttpServletRequest request,
					jakarta.servlet.http.HttpServletResponse response, jakarta.servlet.FilterChain filterChain)
					throws jakarta.servlet.ServletException, java.io.IOException {
				String fullUrl = request.getRequestURL().toString();
				String uri = request.getRequestURI();
				if (fullUrl.endsWith("/") && uri.length() > 1) {
					// Redirect to the URL without the trailing slash
					response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_MOVED_PERMANENTLY);
					response.setHeader(org.springframework.http.HttpHeaders.LOCATION,
							fullUrl.substring(0, fullUrl.length() - 1));
					return;
				}
				filterChain.doFilter(request, response);
			}
		};
	}

}
