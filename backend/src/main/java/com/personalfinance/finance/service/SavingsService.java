package com.personalfinance.finance.service;

import com.personalfinance.finance.entity.SavingsDeposit;
import com.personalfinance.finance.entity.SavingsGoal;
import com.personalfinance.finance.entity.User;
import com.personalfinance.finance.repository.SavingsDepositRepository;
import com.personalfinance.finance.repository.SavingsGoalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SavingsService {

    private final SavingsGoalRepository goalRepository;
    private final SavingsDepositRepository depositRepository;
    private final AuthService authService;

    public SavingsService(
            SavingsGoalRepository goalRepository,
            SavingsDepositRepository depositRepository,
            AuthService authService) {
        this.goalRepository = goalRepository;
        this.depositRepository = depositRepository;
        this.authService = authService;
    }

    public List<SavingsGoal> getAllGoals() {
        User user = authService.getAuthenticatedUser();
        return goalRepository.findByUser(user);
    }

    public SavingsGoal createGoal(SavingsGoal goal) {
        User user = authService.getAuthenticatedUser();
        goal.setUser(user);
        if (goal.getSaved() == null) {
            goal.setSaved(BigDecimal.ZERO);
        }
        return goalRepository.save(goal);
    }

    public SavingsGoal updateGoal(Long id, SavingsGoal updated) {
        User user = authService.getAuthenticatedUser();
        SavingsGoal goal = goalRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Goal not found with ID: " + id));

        goal.setName(updated.getName());
        goal.setTarget(updated.getTarget());
        if (updated.getSaved() != null) {
            goal.setSaved(updated.getSaved());
        }
        goal.setTargetDate(updated.getTargetDate());

        return goalRepository.save(goal);
    }

    public void deleteGoal(Long id) {
        User user = authService.getAuthenticatedUser();
        SavingsGoal goal = goalRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Goal not found with ID: " + id));
        goalRepository.delete(goal);
    }

    public List<SavingsDeposit> getAllDeposits() {
        User user = authService.getAuthenticatedUser();
        return depositRepository.findByUserOrderByDateDesc(user);
    }

    public SavingsDeposit addDeposit(SavingsDeposit deposit) {
        User user = authService.getAuthenticatedUser();
        deposit.setUser(user);
        if (deposit.getRemaining() == null) {
            deposit.setRemaining(deposit.getAmount());
        }
        return depositRepository.save(deposit);
    }

    @Transactional
    public SavingsGoal allocateToGoal(Long goalId, BigDecimal amount) {
        User user = authService.getAuthenticatedUser();
        SavingsGoal goal = goalRepository.findByIdAndUser(goalId, user)
                .orElseThrow(() -> new RuntimeException("Goal not found with ID: " + goalId));

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Allocation amount must be greater than zero.");
        }

        List<SavingsDeposit> deposits = depositRepository.findByUserOrderByDateDesc(user);
        BigDecimal remainingToAllocate = amount;

        for (SavingsDeposit deposit : deposits) {
            if (deposit.getRemaining() != null && deposit.getRemaining().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal availableInDeposit = deposit.getRemaining();
                if (availableInDeposit.compareTo(remainingToAllocate) >= 0) {
                    deposit.setRemaining(availableInDeposit.subtract(remainingToAllocate));
                    depositRepository.save(deposit);
                    remainingToAllocate = BigDecimal.ZERO;
                    break;
                } else {
                    remainingToAllocate = remainingToAllocate.subtract(availableInDeposit);
                    deposit.setRemaining(BigDecimal.ZERO);
                    depositRepository.save(deposit);
                }
            }
        }

        if (remainingToAllocate.compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalStateException("Insufficient available savings deposit pool.");
        }

        BigDecimal currentSaved = goal.getSaved() != null ? goal.getSaved() : BigDecimal.ZERO;
        goal.setSaved(currentSaved.add(amount));

        return goalRepository.save(goal);
    }
}
