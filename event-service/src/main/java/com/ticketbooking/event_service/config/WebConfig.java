package com.ticketbooking.event_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.util.pattern.PathPatternParser;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // Cho phép cả /api/events và /api/events/ đều hoạt động
        PathPatternParser parser = new PathPatternParser();
        parser.setMatchOptionalTrailingSeparator(true);
        configurer.setPatternParser(parser);
    }
}
