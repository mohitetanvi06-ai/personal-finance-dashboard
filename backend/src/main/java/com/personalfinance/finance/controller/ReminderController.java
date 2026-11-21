package com.personalfinance.finance.controller;

import com.personalfinance.finance.entity.Reminder;
import com.personalfinance.finance.service.ReminderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    private final ReminderService reminderService;

    public ReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @GetMapping
    public List<Map<String, Object>> getAllReminders() {
        return reminderService.getAllActiveReminders();
    }

    @PostMapping
    public Reminder createReminder(@RequestBody Reminder reminder) {
        return reminderService.createCustomReminder(reminder);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        reminderService.markAsRead(id);
        return ResponseEntity.ok(Map.of("message", "Reminder marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> dismissReminder(@PathVariable Long id) {
        reminderService.dismissReminder(id);
        return ResponseEntity.ok(Map.of("message", "Reminder dismissed successfully"));
    }
}
