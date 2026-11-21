package com.personalfinance.finance.controller;

import com.personalfinance.finance.service.UserPreferenceService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/preferences")
public class UserPreferenceController {

    private final UserPreferenceService userPreferenceService;

    public UserPreferenceController(UserPreferenceService userPreferenceService) {
        this.userPreferenceService = userPreferenceService;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public String getPreferences() {
        return userPreferenceService.getPreferencesJson();
    }

    @PutMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updatePreferences(@RequestBody String preferencesJson) {
        userPreferenceService.updatePreferencesJson(preferencesJson);
        return ResponseEntity.ok(Map.of("message", "Preferences updated successfully"));
    }
}
