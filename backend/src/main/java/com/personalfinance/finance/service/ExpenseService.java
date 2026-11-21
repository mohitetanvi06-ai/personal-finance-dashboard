package com.personalfinance.finance.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.personalfinance.finance.entity.Expense;
import com.personalfinance.finance.entity.User;
import com.personalfinance.finance.repository.ExpenseRepository;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final AuthService authService;

    public ExpenseService(ExpenseRepository expenseRepository, AuthService authService) {
        this.expenseRepository = expenseRepository;
        this.authService = authService;
    }

    public Expense addExpense(Expense expense) {
        User user = authService.getAuthenticatedUser();
        expense.setUser(user);
        return expenseRepository.save(expense);
    }

    public List<Expense> getAllExpenses() {
        User user = authService.getAuthenticatedUser();
        return expenseRepository.findByUserOrderByDateDesc(user);
    }

    public Expense getExpenseById(Long id) {
        User user = authService.getAuthenticatedUser();
        return expenseRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Expense not found with ID: " + id));
    }

    public Expense updateExpense(Long id, Expense updatedExpense) {
        Expense existingExpense = getExpenseById(id);

        existingExpense.setTitle(updatedExpense.getTitle());
        existingExpense.setCategory(updatedExpense.getCategory());
        existingExpense.setAmount(updatedExpense.getAmount());
        existingExpense.setDate(updatedExpense.getDate());
        existingExpense.setDescription(updatedExpense.getDescription());

        return expenseRepository.save(existingExpense);
    }

    public void deleteExpense(Long id) {
        Expense existingExpense = getExpenseById(id);
        expenseRepository.delete(existingExpense);
    }
}
