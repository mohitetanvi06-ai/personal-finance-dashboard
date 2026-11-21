package com.personalfinance.finance.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.personalfinance.finance.entity.Income;
import com.personalfinance.finance.entity.User;
import com.personalfinance.finance.repository.IncomeRepository;

@Service
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final AuthService authService;

    public IncomeService(IncomeRepository incomeRepository, AuthService authService) {
        this.incomeRepository = incomeRepository;
        this.authService = authService;
    }

    public Income addIncome(Income income) {
        User user = authService.getAuthenticatedUser();
        income.setUser(user);
        return incomeRepository.save(income);
    }

    public List<Income> getAllIncome() {
        User user = authService.getAuthenticatedUser();
        return incomeRepository.findByUserOrderByDateDesc(user);
    }

    public Income getIncomeById(Long id) {
        User user = authService.getAuthenticatedUser();
        return incomeRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Income not found with ID: " + id));
    }

    public Income updateIncome(Long id, Income updatedIncome) {
        Income existingIncome = getIncomeById(id);

        existingIncome.setSource(updatedIncome.getSource());
        existingIncome.setCategory(updatedIncome.getCategory() != null ? updatedIncome.getCategory() : "Other");
        existingIncome.setAmount(updatedIncome.getAmount());
        existingIncome.setDate(updatedIncome.getDate());
        existingIncome.setDescription(updatedIncome.getDescription());

        return incomeRepository.save(existingIncome);
    }

    public void deleteIncome(Long id) {
        Income existingIncome = getIncomeById(id);
        incomeRepository.delete(existingIncome);
    }
}