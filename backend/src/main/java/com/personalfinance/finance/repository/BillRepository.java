package com.personalfinance.finance.repository;

import com.personalfinance.finance.entity.Bill;
import com.personalfinance.finance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByUserOrderByDueDateAsc(User user);
    Optional<Bill> findByIdAndUser(Long id, User user);
}
