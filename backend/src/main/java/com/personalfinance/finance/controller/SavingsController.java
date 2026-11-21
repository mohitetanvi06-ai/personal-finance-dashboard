package com.personalfinance.finance.controller;

import com.personalfinance.finance.entity.SavingsDeposit;
import com.personalfinance.finance.entity.SavingsGoal;
import com.personalfinance.finance.service.SavingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/savings")
public class SavingsController {

    private final SavingsService savingsService;

    public SavingsController(SavingsService savingsService) {
        this.savingsService = savingsService;
    }

    // Goals Endpoints
    @GetMapping("/goals")
    public List<SavingsGoal> getAllGoals() {
        return savingsService.getAllGoals();
    }

    @PostMapping("/goals")
    public SavingsGoal createGoal(@RequestBody SavingsGoal goal) {
        return savingsService.createGoal(goal);
    }

    @PutMapping("/goals/{id}")
    public SavingsGoal updateGoal(@PathVariable Long id, @RequestBody SavingsGoal goal) {
        return savingsService.updateGoal(id, goal);
    }

    @DeleteMapping("/goals/{id}")
    public ResponseEntity<?> deleteGoal(@PathVariable Long id) {
        savingsService.deleteGoal(id);
        return ResponseEntity.ok(Map.of("message", "Savings goal deleted successfully"));
    }

    @PostMapping("/goals/{id}/allocate")
    public SavingsGoal allocateToGoal(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        return savingsService.allocateToGoal(id, amount);
    }

    // Deposits Endpoints
    @GetMapping("/deposits")
    public List<SavingsDeposit> getAllDeposits() {
        return savingsService.getAllDeposits();
    }

    @PostMapping("/deposits")
    public SavingsDeposit addDeposit(@RequestBody SavingsDeposit deposit) {
        return savingsService.addDeposit(deposit);
    }
}
