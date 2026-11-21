package com.personalfinance.finance.repository;

import com.personalfinance.finance.entity.SavingsDeposit;
import com.personalfinance.finance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavingsDepositRepository extends JpaRepository<SavingsDeposit, Long> {
    List<SavingsDeposit> findByUserOrderByDateDesc(User user);
    Optional<SavingsDeposit> findByIdAndUser(Long id, User user);
}
