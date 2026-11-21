package com.personalfinance.finance.repository;

import com.personalfinance.finance.entity.Income;
import com.personalfinance.finance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {
    List<Income> findByUserOrderByDateDesc(User user);
    Optional<Income> findByIdAndUser(Long id, User user);
}