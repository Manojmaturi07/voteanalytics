package com.voteanalytics.service;

import com.voteanalytics.entity.Poll;
import com.voteanalytics.entity.User;

import java.util.List;

public interface EmailService {
    void sendVerificationEmail(User user);
    boolean verifyEmail(String token);
    void resendVerification(String email);
    void sendNewPollNotification(Poll poll, List<String> recipientEmails);
}
