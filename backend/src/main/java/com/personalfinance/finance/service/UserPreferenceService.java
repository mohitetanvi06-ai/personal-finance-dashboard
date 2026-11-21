package com.personalfinance.finance.service;

import com.personalfinance.finance.entity.User;
import com.personalfinance.finance.entity.UserPreference;
import com.personalfinance.finance.repository.UserPreferenceRepository;
import org.springframework.stereotype.Service;

@Service
public class UserPreferenceService {

    private final UserPreferenceRepository userPreferenceRepository;
    private final AuthService authService;

    public UserPreferenceService(UserPreferenceRepository userPreferenceRepository, AuthService authService) {
        this.userPreferenceRepository = userPreferenceRepository;
        this.authService = authService;
    }

    public String getPreferencesJson() {
        User user = authService.getAuthenticatedUser();
        return userPreferenceRepository.findByUser(user)
                .map(UserPreference::getPreferencesJson)
                .orElse("{}");
    }

    public void updatePreferencesJson(String preferencesJson) {
        User user = authService.getAuthenticatedUser();
        UserPreference pref = userPreferenceRepository.findByUser(user)
                .orElseGet(() -> new UserPreference("{}", user));
        pref.setPreferencesJson(preferencesJson);
        userPreferenceRepository.save(pref);
    }
}
