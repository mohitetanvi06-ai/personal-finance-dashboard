package com.personalfinance.finance.dto;

import java.util.List;
import java.util.Map;

public class MigrationDto {

    private List<Map<String, Object>> income;
    private List<Map<String, Object>> expense;
    private List<Map<String, Object>> budgets;
    private List<Map<String, Object>> bills;
    private List<Map<String, Object>> savingsGoals;
    private List<Map<String, Object>> savingsDeposits;
    private Map<String, String> calendarNotes;
    private Map<String, Object> preferences;

    public MigrationDto() {}

    public List<Map<String, Object>> getIncome() {
        return income;
    }

    public void setIncome(List<Map<String, Object>> income) {
        this.income = income;
    }

    public List<Map<String, Object>> getExpense() {
        return expense;
    }

    public void setExpense(List<Map<String, Object>> expense) {
        this.expense = expense;
    }

    public List<Map<String, Object>> getBudgets() {
        return budgets;
    }

    public void setBudgets(List<Map<String, Object>> budgets) {
        this.budgets = budgets;
    }

    public List<Map<String, Object>> getBills() {
        return bills;
    }

    public void setBills(List<Map<String, Object>> bills) {
        this.bills = bills;
    }

    public List<Map<String, Object>> getSavingsGoals() {
        return savingsGoals;
    }

    public void setSavingsGoals(List<Map<String, Object>> savingsGoals) {
        this.savingsGoals = savingsGoals;
    }

    public List<Map<String, Object>> getSavingsDeposits() {
        return savingsDeposits;
    }

    public void setSavingsDeposits(List<Map<String, Object>> savingsDeposits) {
        this.savingsDeposits = savingsDeposits;
    }

    public Map<String, String> getCalendarNotes() {
        return calendarNotes;
    }

    public void setCalendarNotes(Map<String, String> calendarNotes) {
        this.calendarNotes = calendarNotes;
    }

    public Map<String, Object> getPreferences() {
        return preferences;
    }

    public void setPreferences(Map<String, Object> preferences) {
        this.preferences = preferences;
    }
}
