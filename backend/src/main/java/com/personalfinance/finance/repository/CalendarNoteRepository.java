package com.personalfinance.finance.repository;

import com.personalfinance.finance.entity.CalendarNote;
import com.personalfinance.finance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CalendarNoteRepository extends JpaRepository<CalendarNote, Long> {
    List<CalendarNote> findByUser(User user);
    Optional<CalendarNote> findByUserAndDateKey(User user, String dateKey);
}
