package com.voteanalytics.service;

import com.voteanalytics.dto.auth.TwoFactorSetupResponse;
import com.voteanalytics.entity.User;

import java.util.List;

public interface TwoFactorService {
    TwoFactorSetupResponse setupTwoFactor(String username);
    boolean verifyAndEnableTwoFactor(String username, String code);
    void disableTwoFactor(String username);
    List<String> generateBackupCodes(String username);
    boolean verifyTwoFactorCode(User user, String code);
}
