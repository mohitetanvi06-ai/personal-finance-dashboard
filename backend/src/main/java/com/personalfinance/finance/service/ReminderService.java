package com.personalfinance.finance.service;

import com.personalfinance.finance.entity.*;
import com.personalfinance.finance.repository.BillRepository;
import com.personalfinance.finance.repository.BudgetRepository;
import com.personalfinance.finance.repository.ExpenseRepository;
import com.personalfinance.finance.repository.ReminderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final BillRepository billRepository;
    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final AuthService authService;

    public ReminderService(
            ReminderRepository reminderRepository,
            BillRepository billRepository,
            BudgetRepository budgetRepository,
            ExpenseRepository expenseRepository,
            AuthService authService) {
        this.reminderRepository = reminderRepository;
        this.billRepository = billRepository;
        this.budgetRepository = budgetRepository;
        this.expenseRepository = expenseRepository;
        this.authService = authService;
    }

    public List<Map<String, Object>> getAllActiveReminders() {
        User user = authService.getAuthenticatedUser();
        List<Map<String, Object>> remindersList = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // 1. Custom stored reminders
        List<Reminder> storedReminders = reminderRepository.findByUserAndIsDismissedFalseOrderByDueDateAsc(user);
        for (Reminder r : storedReminders) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", r.getId());
            item.put("title", r.getTitle());
            item.put("description", r.getDescription());
            item.put("type", r.getType());
            item.put("dueDate", r.getDueDate());
            item.put("isRead", r.isRead());
            item.put("isCustom", true);
            remindersList.add(item);
        }

        // 2. Smart Bill & EMI Reminders
        List<Bill> activeBills = billRepository.findByUserOrderByDueDateAsc(user);
        for (Bill bill : activeBills) {
            if ("completed".equalsIgnoreCase(bill.getStatus()) || bill.getDueDate() == null) {
                continue;
            }

            try {
                LocalDate dueDate = LocalDate.parse(bill.getDueDate());
                long daysUntilDue = ChronoUnit.DAYS.between(today, dueDate);

                if (daysUntilDue < 0) {
                    // Overdue
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", "bill-overdue-" + bill.getId());
                    item.put("title", "Overdue: " + bill.getName());
                    item.put("description", "₹" + bill.getAmount() + " was due on " + bill.getDueDate() + " (" + Math.abs(daysUntilDue) + " days ago)");
                    item.put("type", "BILL_OVERDUE");
                    item.put("dueDate", bill.getDueDate());
                    item.put("urgency", "high");
                    item.put("isCustom", false);
                    remindersList.add(item);
                } else if (daysUntilDue <= 7) {
                    // Due soon
                    String dueText = daysUntilDue == 0 ? "Due today" : "Due in " + daysUntilDue + " day(s)";
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", "bill-duesoon-" + bill.getId());
                    item.put("title", dueText + ": " + bill.getName());
                    item.put("description", "₹" + bill.getAmount() + " is due on " + bill.getDueDate() + " (" + bill.getType() + ")");
                    item.put("type", "BILL_DUE");
                    item.put("dueDate", bill.getDueDate());
                    item.put("urgency", daysUntilDue <= 2 ? "high" : "medium");
                    item.put("isCustom", false);
                    remindersList.add(item);
                }
            } catch (Exception ignored) {}
        }

        // 3. Smart Budget Warnings
        List<Budget> budgets = budgetRepository.findByUser(user);
        if (!budgets.isEmpty()) {
            List<Expense> expenses = expenseRepository.findByUserOrderByDateDesc(user);
            Map<String, BigDecimal> categorySpending = new HashMap<>();

            for (Expense exp : expenses) {
                if (exp.getDate() != null && exp.getDate().getYear() == today.getYear() && exp.getDate().getMonth() == today.getMonth()) {
                    String cat = (exp.getCategory() != null ? exp.getCategory() : "Other").trim().toLowerCase();
                    BigDecimal current = categorySpending.getOrDefault(cat, BigDecimal.ZERO);
                    categorySpending.put(cat, current.add(exp.getAmount() != null ? exp.getAmount() : BigDecimal.ZERO));
                }
            }

            for (Budget b : budgets) {
                String cat = b.getCategory().trim().toLowerCase();
                BigDecimal spent = categorySpending.getOrDefault(cat, BigDecimal.ZERO);
                BigDecimal limit = b.getAmount();

                if (limit != null && limit.compareTo(BigDecimal.ZERO) > 0) {
                    if (spent.compareTo(limit) > 0) {
                        BigDecimal over = spent.subtract(limit);
                        Map<String, Object> item = new HashMap<>();
                        item.put("id", "budget-exceeded-" + b.getId());
                        item.put("title", "Budget Exceeded: " + b.getCategory());
                        item.put("description", "Spent ₹" + spent + " exceeding ₹" + limit + " limit by ₹" + over);
                        item.put("type", "BUDGET_EXCEEDED");
                        item.put("urgency", "high");
                        item.put("isCustom", false);
                        remindersList.add(item);
                    } else {
                        BigDecimal percent = spent.multiply(BigDecimal.valueOf(100)).divide(limit, 0, RoundingMode.HALF_UP);
                        if (percent.compareTo(BigDecimal.valueOf(80)) >= 0) {
                            Map<String, Object> item = new HashMap<>();
                            item.put("id", "budget-warning-" + b.getId());
                            item.put("title", "Budget Alert (" + percent + "%): " + b.getCategory());
                            item.put("description", "Spent ₹" + spent + " of ₹" + limit + " limit this month.");
                            item.put("type", "BUDGET_WARNING");
                            item.put("urgency", "medium");
                            item.put("isCustom", false);
                            remindersList.add(item);
                        }
                    }
                }
            }
        }

        return remindersList;
    }

    public Reminder createCustomReminder(Reminder reminder) {
        User user = authService.getAuthenticatedUser();
        reminder.setUser(user);
        reminder.setType("CUSTOM");
        return reminderRepository.save(reminder);
    }

    public void markAsRead(Long id) {
        User user = authService.getAuthenticatedUser();
        reminderRepository.findByIdAndUser(id, user).ifPresent(r -> {
            r.setRead(true);
            reminderRepository.save(r);
        });
    }

    public void dismissReminder(Long id) {
        User user = authService.getAuthenticatedUser();
        reminderRepository.findByIdAndUser(id, user).ifPresent(r -> {
            r.setDismissed(true);
            reminderRepository.save(r);
        });
    }
}
