package com.blockchain.food;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

/**
 * Main Application Class for Food Traceability System
 * 
 * @author Nhom13
 * @version 1.0.0
 */
@SpringBootApplication
public class FoodTraceabilityApplication {

    public static void main(String[] args) {
        SpringApplication.run(FoodTraceabilityApplication.class, args);
        System.out.println("=".repeat(80));
        System.out.println("🚀 Food Traceability Backend API Started Successfully!");
        System.out.println("📚 API Documentation: http://localhost:8080/swagger-ui.html");
        System.out.println("🔗 API Base URL: http://localhost:8080/api");
        System.out.println("=".repeat(80));
    }

    /**
     * CORS Configuration Bean
     * Allows frontend to communicate with backend
     */
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.setAllowCredentials(true);
        corsConfiguration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",  // Vite dev server
            "http://localhost:3000"   // Production/Docker
        ));
        corsConfiguration.setAllowedHeaders(Arrays.asList(
            "Origin", "Access-Control-Allow-Origin", 
            "Content-Type", "Accept", "Authorization",
            "Origin, Accept", "X-Requested-With",
            "Access-Control-Request-Method", "Access-Control-Request-Headers"
        ));
        corsConfiguration.setExposedHeaders(Arrays.asList(
            "Origin", "Content-Type", "Accept", "Authorization",
            "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"
        ));
        corsConfiguration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));

        UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
        urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);

        return new CorsFilter(urlBasedCorsConfigurationSource);
    }
}
