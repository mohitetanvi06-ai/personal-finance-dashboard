package com.personalfinance.finance.controller;

import com.personalfinance.finance.service.CalendarNoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/calendar-notes")
public class CalendarNoteController {

    private final CalendarNoteService calendarNoteService;

    public CalendarNoteController(CalendarNoteService calendarNoteService) {
        this.calendarNoteService = calendarNoteService;
    }

    @GetMapping
    public Map<String, String> getAllNotes() {
        return calendarNoteService.getAllNotesMap();
    }

    @PostMapping
    public ResponseEntity<?> saveNote(@RequestBody Map<String, String> payload) {
        String dateKey = payload.get("dateKey");
        String note = payload.get("note");
        if (dateKey == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "dateKey is required"));
        }
        calendarNoteService.saveNote(dateKey, note);
        return ResponseEntity.ok(Map.of("message", "Note saved successfully"));
    }
}
