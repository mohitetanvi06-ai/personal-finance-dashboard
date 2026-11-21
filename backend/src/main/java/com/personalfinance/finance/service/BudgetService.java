package com.personalfinance.finance.service;

import com.personalfinance.finance.entity.Budget;
import com.personalfinance.finance.entity.User;
import com.personalfinance.finance.repository.BudgetRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final AuthService authService;

    public BudgetService(BudgetRepository budgetRepository, AuthService authService) {
        this.budgetRepository = budgetRepository;
        this.authService = authService;
    }

    public List<Budget> getAllBudgets() {
        User user = authService.getAuthenticatedUser();
        return budgetRepository.findByUser(user);
    }

    public Budget saveOrUpdateBudget(Budget budget) {
        User user = authService.getAuthenticatedUser();
        String category = budget.getCategory().trim();

        return budgetRepository.findByUserAndCategoryIgnoreCase(user, category)
                .map(existing -> {
                    existing.setAmount(budget.getAmount());
                    return budgetRepository.save(existing);
                })
                .orElseGet(() -> {
                    budget.setUser(user);
                    budget.setCategory(category);
                    return budgetRepository.save(budget);
                });
    }

    public void deleteBudget(Long id) {
        User user = authService.getAuthenticatedUser();
        Budget budget = budgetRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Budget not found with ID: " + id));
        budgetRepository.delete(budget);
    }
}
