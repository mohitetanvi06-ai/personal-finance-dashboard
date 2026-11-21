package com.personalfinance.finance.service;

import com.personalfinance.finance.entity.CalendarNote;
import com.personalfinance.finance.entity.User;
import com.personalfinance.finance.repository.CalendarNoteRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CalendarNoteService {

    private final CalendarNoteRepository calendarNoteRepository;
    private final AuthService authService;

    public CalendarNoteService(CalendarNoteRepository calendarNoteRepository, AuthService authService) {
        this.calendarNoteRepository = calendarNoteRepository;
        this.authService = authService;
    }

    public Map<String, String> getAllNotesMap() {
        User user = authService.getAuthenticatedUser();
        List<CalendarNote> notes = calendarNoteRepository.findByUser(user);
        Map<String, String> map = new HashMap<>();
        for (CalendarNote note : notes) {
            map.put(note.getDateKey(), note.getNote());
        }
        return map;
    }

    public void saveNote(String dateKey, String noteText) {
        User user = authService.getAuthenticatedUser();
        CalendarNote note = calendarNoteRepository.findByUserAndDateKey(user, dateKey)
                .orElseGet(() -> new CalendarNote(dateKey, "", user));

        if (noteText == null || noteText.trim().isEmpty()) {
            if (note.getId() != null) {
                calendarNoteRepository.delete(note);
            }
        } else {
            note.setNote(noteText.trim());
            calendarNoteRepository.save(note);
        }
    }
}
