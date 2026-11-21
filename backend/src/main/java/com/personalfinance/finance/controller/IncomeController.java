
package com.personalfinance.finance.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.personalfinance.finance.entity.Income;
import com.personalfinance.finance.service.IncomeService;

@RestController
@RequestMapping("/api/income")
@CrossOrigin(origins = "http://localhost:5173")
public class IncomeController {

    private final IncomeService incomeService;

    public IncomeController(IncomeService incomeService) {
        this.incomeService = incomeService;
    }

    // Add Income
    @PostMapping
    public Income addIncome(@RequestBody Income income) {
        return incomeService.addIncome(income);
    }

    // Get All Income
    @GetMapping
    public List<Income> getAllIncome() {
        return incomeService.getAllIncome();
    }

    // Get Income By ID
    @GetMapping("/{id}")
    public Income getIncomeById(@PathVariable Long id) {
        return incomeService.getIncomeById(id);
    }

    // Update Income
    @PutMapping("/{id}")
    public Income updateIncome(
            @PathVariable Long id,
            @RequestBody Income income) {

        return incomeService.updateIncome(id, income);
    }

    // Delete Income
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteIncome(@PathVariable Long id) {

        incomeService.deleteIncome(id);

        return ResponseEntity.ok("Income deleted successfully");
    }
}
