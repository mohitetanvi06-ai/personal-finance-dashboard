package com.personalfinance.finance.repository;

import com.personalfinance.finance.entity.Expense;
import com.personalfinance.finance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserOrderByDateDesc(User user);
    Optional<Expense> findByIdAndUser(Long id, User user);
}
