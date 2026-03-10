package com.blockchain.food.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health Check Controller
 * Provides API health status and system information
 * 
 * @author Nhom13
 */
@RestController
@RequestMapping("/api")
public class HealthCheckController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Food Traceability Backend API");
        response.put("version", "1.0.0");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("message", "Service is running successfully! 🚀");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        Map<String, Object> response = new HashMap<>();
        response.put("application", "Food Traceability System");
        response.put("description", "Blockchain-based Food Supply Chain Traceability");
        response.put("team", "Nhom13");
        response.put("backend", "Java Spring Boot 3.2.3");
        response.put("frontend", "React 18.3.1 + Vite");
        response.put("blockchain", "Ethereum + Web3j");
        response.put("database", "MySQL 8.0");
        
        return ResponseEntity.ok(response);
    }
}
