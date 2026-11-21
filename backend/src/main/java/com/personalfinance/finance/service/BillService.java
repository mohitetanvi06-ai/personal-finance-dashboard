package com.personalfinance.finance.service;

import com.personalfinance.finance.entity.Bill;
import com.personalfinance.finance.entity.BillPayment;
import com.personalfinance.finance.entity.Expense;
import com.personalfinance.finance.entity.User;
import com.personalfinance.finance.repository.BillPaymentRepository;
import com.personalfinance.finance.repository.BillRepository;
import com.personalfinance.finance.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final BillPaymentRepository billPaymentRepository;
    private final ExpenseRepository expenseRepository;
    private final AuthService authService;

    public BillService(
            BillRepository billRepository,
            BillPaymentRepository billPaymentRepository,
            ExpenseRepository expenseRepository,
            AuthService authService) {
        this.billRepository = billRepository;
        this.billPaymentRepository = billPaymentRepository;
        this.expenseRepository = expenseRepository;
        this.authService = authService;
    }

    public List<Bill> getAllBills() {
        User user = authService.getAuthenticatedUser();
        return billRepository.findByUserOrderByDueDateAsc(user);
    }

    public Bill createBill(Bill bill) {
        User user = authService.getAuthenticatedUser();
        bill.setUser(user);
        if (bill.getStatus() == null) {
            bill.setStatus("active");
        }
        if (bill.getPaidInstallments() == null) {
            bill.setPaidInstallments(0);
        }
        return billRepository.save(bill);
    }

    public Bill updateBill(Long id, Bill updated) {
        User user = authService.getAuthenticatedUser();
        Bill bill = billRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Bill not found with ID: " + id));

        bill.setName(updated.getName());
        bill.setType(updated.getType());
        bill.setAmount(updated.getAmount());
        bill.setDueDate(updated.getDueDate());
        bill.setFrequency(updated.getFrequency());
        bill.setTotalInstallments(updated.getTotalInstallments());
        bill.setStatus(updated.getStatus());

        return billRepository.save(bill);
    }

    public void deleteBill(Long id) {
        User user = authService.getAuthenticatedUser();
        Bill bill = billRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Bill not found with ID: " + id));
        billRepository.delete(bill);
    }

    @Transactional
    public Bill recordPayment(Long id, BigDecimal paymentAmount, String paymentDate) {
        User user = authService.getAuthenticatedUser();
        Bill bill = billRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Bill not found with ID: " + id));

        BigDecimal amount = paymentAmount != null ? paymentAmount : bill.getAmount();
        String dateStr = paymentDate != null ? paymentDate : LocalDate.now().toString();

        BillPayment payment = new BillPayment(amount, dateStr, bill);
        bill.getPayments().add(payment);

        int paid = (bill.getPaidInstallments() != null ? bill.getPaidInstallments() : 0) + 1;
        bill.setPaidInstallments(paid);

        Integer total = bill.getTotalInstallments();
        if (total != null && total > 0 && paid >= total) {
            bill.setStatus("completed");
        } else if ("once".equalsIgnoreCase(bill.getFrequency())) {
            bill.setStatus("completed");
        } else {
            bill.setDueDate(advanceDueDate(bill.getDueDate(), bill.getFrequency()));
        }

        Bill savedBill = billRepository.save(bill);

        // Record as an expense in expenses table
        Expense expense = new Expense();
        expense.setTitle(bill.getName() + " (" + bill.getType() + " Payment)");
        expense.setCategory(bill.getType().equalsIgnoreCase("EMI") ? "EMI" : "Bills");
        expense.setAmount(amount);
        try {
            expense.setDate(LocalDate.parse(dateStr));
        } catch (Exception e) {
            expense.setDate(LocalDate.now());
        }
        expense.setDescription("Automatic payment record for " + bill.getName());
        expense.setUser(user);
        expenseRepository.save(expense);

        return savedBill;
    }

    private String advanceDueDate(String currentDueDate, String frequency) {
        if (currentDueDate == null) return null;
        try {
            LocalDate date = LocalDate.parse(currentDueDate);
            int monthsToAdd = switch (frequency.toLowerCase()) {
                case "quarterly" -> 3;
                case "yearly" -> 12;
                default -> 1; // monthly
            };
            return date.plusMonths(monthsToAdd).format(DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (Exception e) {
            return currentDueDate;
        }
    }
}
