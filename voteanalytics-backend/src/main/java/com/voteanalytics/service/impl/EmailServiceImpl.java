package com.voteanalytics.service.impl;

import com.voteanalytics.entity.EmailVerificationToken;
import com.voteanalytics.entity.Poll;
import com.voteanalytics.entity.User;
import com.voteanalytics.exception.BadRequestException;
import com.voteanalytics.exception.ResourceNotFoundException;
import com.voteanalytics.repository.EmailVerificationTokenRepository;
import com.voteanalytics.repository.UserRepository;
import com.voteanalytics.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.mail.from:noreply@voteanalytics.com}")
    private String mailFrom;

    @Override
    @Transactional
    public void sendVerificationEmail(User user) {
        tokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .user(user)
                .token(token)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .build();
        tokenRepository.save(verificationToken);

        String verifyLink = frontendUrl + "/verify-email/" + token;
        String subject = "Verify your VoteAnalytics account";
        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>"
                + "<h2 style='color: #4f46e5;'>Welcome to VoteAnalytics!</h2>"
                + "<p>Hi " + user.getName() + ",</p>"
                + "<p>Please click the button below to verify your email address:</p>"
                + "<p style='margin: 30px 0;'><a href='" + verifyLink + "' style='background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Verify Email</a></p>"
                + "<p>Or copy this link: <a href='" + verifyLink + "'>" + verifyLink + "</a></p>"
                + "<p style='color: #6b7280; font-size: 12px; margin-top: 30px;'>This link will expire in 24 hours.</p>"
                + "</div>";

        sendHtmlEmail(user.getEmail(), subject, htmlContent);
    }

    @Override
    @Transactional
    public boolean verifyEmail(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification token"));

        if (verificationToken.isExpired()) {
            tokenRepository.delete(verificationToken);
            throw new BadRequestException("Verification token has expired. Please request a new one.");
        }

        User user = verificationToken.getUser();
        user.setIsEmailVerified(true);
        userRepository.save(user);

        tokenRepository.delete(verificationToken);
        return true;
    }

    @Override
    @Transactional
    public void resendVerification(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email: " + email));

        if (Boolean.TRUE.equals(user.getIsEmailVerified())) {
            throw new BadRequestException("This email is already verified. Please login.");
        }

        sendVerificationEmail(user);
    }

    @Async
    @Override
    public void sendNewPollNotification(Poll poll, List<String> recipientEmails) {
        if (recipientEmails == null || recipientEmails.isEmpty()) return;

        String pollUrl = frontendUrl + "/poll/" + poll.getId();
        String subject = "New Poll Available: " + poll.getQuestion();
        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>"
                + "<h2 style='color: #4f46e5;'>New Poll Available!</h2>"
                + "<p>A new poll has been created and is now open for voting:</p>"
                + "<div style='background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;'>"
                + "<h3 style='margin-top: 0;'>" + poll.getQuestion() + "</h3>"
                + "<p><strong>Deadline:</strong> " + poll.getDeadline() + "</p>"
                + (poll.getCategory() != null ? "<p><strong>Category:</strong> " + poll.getCategory() + "</p>" : "")
                + "</div>"
                + "<a href='" + pollUrl + "' style='display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;'>Vote Now</a>"
                + "</div>";

        for (String email : recipientEmails) {
            sendHtmlEmail(email, subject, htmlContent);
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
