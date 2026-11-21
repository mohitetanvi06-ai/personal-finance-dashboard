package com.personalfinance.finance.controller;

import com.personalfinance.finance.dto.MigrationDto;
import com.personalfinance.finance.service.MigrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class MigrationController {

    private final MigrationService migrationService;

    public MigrationController(MigrationService migrationService) {
        this.migrationService = migrationService;
    }

    @GetMapping("/finance/all")
    public ResponseEntity<Map<String, Object>> getAllFinanceData() {
        return ResponseEntity.ok(migrationService.getAllFinanceData());
    }

    @PostMapping("/migration/import")
    public ResponseEntity<?> importData(@RequestBody MigrationDto dto) {
        migrationService.importData(dto);
        return ResponseEntity.ok(Map.of("message", "Finance data imported successfully"));
    }
}
