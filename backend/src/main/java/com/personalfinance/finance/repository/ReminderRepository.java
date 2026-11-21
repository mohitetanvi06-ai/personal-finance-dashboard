package com.personalfinance.finance.repository;

import com.personalfinance.finance.entity.Reminder;
import com.personalfinance.finance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUserAndIsDismissedFalseOrderByDueDateAsc(User user);
    Optional<Reminder> findByIdAndUser(Long id, User user);
}
