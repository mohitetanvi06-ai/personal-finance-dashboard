package com.personalfinance.finance.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalfinance.finance.dto.MigrationDto;
import com.personalfinance.finance.entity.*;
import com.personalfinance.finance.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class MigrationService {

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final BillRepository billRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final SavingsDepositRepository savingsDepositRepository;
    private final CalendarNoteRepository calendarNoteRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final AuthService authService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MigrationService(
            IncomeRepository incomeRepository,
            ExpenseRepository expenseRepository,
            BudgetRepository budgetRepository,
            BillRepository billRepository,
            SavingsGoalRepository savingsGoalRepository,
            SavingsDepositRepository savingsDepositRepository,
            CalendarNoteRepository calendarNoteRepository,
            UserPreferenceRepository userPreferenceRepository,
            AuthService authService) {
        this.incomeRepository = incomeRepository;
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
        this.billRepository = billRepository;
        this.savingsGoalRepository = savingsGoalRepository;
        this.savingsDepositRepository = savingsDepositRepository;
        this.calendarNoteRepository = calendarNoteRepository;
        this.userPreferenceRepository = userPreferenceRepository;
        this.authService = authService;
    }

    public Map<String, Object> getAllFinanceData() {
        User user = authService.getAuthenticatedUser();

        List<Income> incomes = incomeRepository.findByUserOrderByDateDesc(user);
        List<Expense> expenses = expenseRepository.findByUserOrderByDateDesc(user);
        List<Budget> budgets = budgetRepository.findByUser(user);
        List<Bill> bills = billRepository.findByUserOrderByDueDateAsc(user);
        List<SavingsGoal> goals = savingsGoalRepository.findByUser(user);
        List<SavingsDeposit> deposits = savingsDepositRepository.findByUserOrderByDateDesc(user);
        List<CalendarNote> notesList = calendarNoteRepository.findByUser(user);

        Map<String, String> calendarNotes = new HashMap<>();
        for (CalendarNote n : notesList) {
            calendarNotes.put(n.getDateKey(), n.getNote());
        }

        Map<String, Object> preferences = new HashMap<>();
        Optional<UserPreference> prefOpt = userPreferenceRepository.findByUser(user);
        if (prefOpt.isPresent() && prefOpt.get().getPreferencesJson() != null) {
            try {
                preferences = objectMapper.readValue(prefOpt.get().getPreferencesJson(), Map.class);
            } catch (Exception ignored) {}
        }

        Map<String, Object> result = new HashMap<>();
        result.put("income", incomes);
        result.put("expense", expenses);
        result.put("budgets", budgets);
        result.put("bills", bills);
        result.put("savingsGoals", goals);
        result.put("savingsDeposits", deposits);
        result.put("calendarNotes", calendarNotes);
        result.put("preferences", preferences);

        return result;
    }

    @Transactional
    public void importData(MigrationDto dto) {
        User user = authService.getAuthenticatedUser();

        // 1. Income
        if (dto.getIncome() != null) {
            for (Map<String, Object> item : dto.getIncome()) {
                try {
                    String source = item.get("source") != null ? item.get("source").toString()
                            : (item.get("title") != null ? item.get("title").toString() : "Income");
                    String category = item.get("category") != null ? item.get("category").toString() : "Other";
                    BigDecimal amount = new BigDecimal(item.get("amount").toString());
                    LocalDate date = LocalDate.parse(item.get("date").toString().substring(0, 10));
                    String desc = item.get("description") != null ? item.get("description").toString() : "";

                    Income income = new Income(source, category, amount, date, desc, user);
                    incomeRepository.save(income);
                } catch (Exception ignored) {}
            }
        }

        // 2. Expense
        if (dto.getExpense() != null) {
            for (Map<String, Object> item : dto.getExpense()) {
                try {
                    String title = item.get("title") != null ? item.get("title").toString() : "Expense";
                    String category = item.get("category") != null ? item.get("category").toString() : "Other";
                    BigDecimal amount = new BigDecimal(item.get("amount").toString());
                    LocalDate date = LocalDate.parse(item.get("date").toString().substring(0, 10));
                    String desc = item.get("description") != null ? item.get("description").toString() : "";

                    Expense expense = new Expense(title, category, amount, date, desc, user);
                    expenseRepository.save(expense);
                } catch (Exception ignored) {}
            }
        }

        // 3. Budgets
        if (dto.getBudgets() != null) {
            for (Map<String, Object> item : dto.getBudgets()) {
                try {
                    String category = item.get("category").toString().trim();
                    BigDecimal amount = new BigDecimal(item.get("amount").toString());

                    Budget budget = budgetRepository.findByUserAndCategoryIgnoreCase(user, category)
                            .orElseGet(() -> new Budget(category, amount, user));
                    budget.setAmount(amount);
                    budgetRepository.save(budget);
                } catch (Exception ignored) {}
            }
        }

        // 4. Bills
        if (dto.getBills() != null) {
            for (Map<String, Object> item : dto.getBills()) {
                try {
                    Bill bill = new Bill();
                    bill.setName(item.get("name") != null ? item.get("name").toString() : "Bill");
                    bill.setType(item.get("type") != null ? item.get("type").toString() : "Other");
                    bill.setAmount(new BigDecimal(item.get("amount").toString()));
                    bill.setDueDate(item.get("dueDate") != null ? item.get("dueDate").toString() : null);
                    bill.setFrequency(item.get("frequency") != null ? item.get("frequency").toString() : "monthly");
                    if (item.get("totalInstallments") != null) {
                        bill.setTotalInstallments(Integer.parseInt(item.get("totalInstallments").toString()));
                    }
                    if (item.get("paidInstallments") != null) {
                        bill.setPaidInstallments(Integer.parseInt(item.get("paidInstallments").toString()));
                    }
                    bill.setStatus(item.get("status") != null ? item.get("status").toString() : "active");
                    bill.setUser(user);
                    billRepository.save(bill);
                } catch (Exception ignored) {}
            }
        }

        // 5. Savings Goals
        if (dto.getSavingsGoals() != null) {
            for (Map<String, Object> item : dto.getSavingsGoals()) {
                try {
                    SavingsGoal goal = new SavingsGoal();
                    goal.setName(item.get("name") != null ? item.get("name").toString() : "Savings Goal");
                    goal.setTarget(new BigDecimal(item.get("target").toString()));
                    goal.setSaved(item.get("saved") != null ? new BigDecimal(item.get("saved").toString()) : BigDecimal.ZERO);
                    goal.setTargetDate(item.get("targetDate") != null ? item.get("targetDate").toString() : null);
                    goal.setUser(user);
                    savingsGoalRepository.save(goal);
                } catch (Exception ignored) {}
            }
        }

        // 6. Savings Deposits
        if (dto.getSavingsDeposits() != null) {
            for (Map<String, Object> item : dto.getSavingsDeposits()) {
                try {
                    SavingsDeposit deposit = new SavingsDeposit();
                    BigDecimal amt = new BigDecimal(item.get("amount").toString());
                    deposit.setAmount(amt);
                    deposit.setRemaining(item.get("remaining") != null ? new BigDecimal(item.get("remaining").toString()) : amt);
                    deposit.setDate(item.get("date") != null ? item.get("date").toString() : LocalDate.now().toString());
                    deposit.setUser(user);
                    savingsDepositRepository.save(deposit);
                } catch (Exception ignored) {}
            }
        }

        // 7. Calendar Notes
        if (dto.getCalendarNotes() != null) {
            for (Map.Entry<String, String> entry : dto.getCalendarNotes().entrySet()) {
                if (entry.getValue() != null && !entry.getValue().trim().isEmpty()) {
                    CalendarNote note = calendarNoteRepository.findByUserAndDateKey(user, entry.getKey())
                            .orElseGet(() -> new CalendarNote(entry.getKey(), "", user));
                    note.setNote(entry.getValue().trim());
                    calendarNoteRepository.save(note);
                }
            }
        }

        // 8. Preferences
        if (dto.getPreferences() != null && !dto.getPreferences().isEmpty()) {
            try {
                String json = objectMapper.writeValueAsString(dto.getPreferences());
                UserPreference pref = userPreferenceRepository.findByUser(user)
                        .orElseGet(() -> new UserPreference("{}", user));
                pref.setPreferencesJson(json);
                userPreferenceRepository.save(pref);
            } catch (Exception ignored) {}
        }
    }
}
