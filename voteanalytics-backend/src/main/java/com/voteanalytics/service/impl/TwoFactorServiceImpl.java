package com.voteanalytics.service.impl;

import com.voteanalytics.dto.auth.TwoFactorSetupResponse;
import com.voteanalytics.entity.TwoFactorBackupCode;
import com.voteanalytics.entity.User;
import com.voteanalytics.exception.BadRequestException;
import com.voteanalytics.exception.ResourceNotFoundException;
import com.voteanalytics.repository.TwoFactorBackupCodeRepository;
import com.voteanalytics.repository.UserRepository;
import com.voteanalytics.service.TwoFactorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TwoFactorServiceImpl implements TwoFactorService {

    private final UserRepository userRepository;
    private final TwoFactorBackupCodeRepository backupCodeRepository;
    private static final SecureRandom random = new SecureRandom();

    @Override
    @Transactional
    public TwoFactorSetupResponse setupTwoFactor(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // Generate 32-char Base32-like random secret
        byte[] buffer = new byte[20];
        random.nextBytes(buffer);
        String secret = Base64.getUrlEncoder().withoutPadding().encodeToString(buffer).substring(0, 32).toUpperCase();

        user.setTwoFactorSecret(secret);
        userRepository.save(user);

        // Generate 10 backup codes
        List<String> backupCodes = generateAndSaveBackupCodes(user);

        String appName = "VoteAnalytics";
        String otpAuthTotpUrl = "otpauth://totp/" + URLEncoder.encode(appName + ":" + user.getEmail(), StandardCharsets.UTF_8)
                + "?secret=" + secret + "&issuer=" + URLEncoder.encode(appName, StandardCharsets.UTF_8);

        String qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data="
                + URLEncoder.encode(otpAuthTotpUrl, StandardCharsets.UTF_8);

        return TwoFactorSetupResponse.builder()
                .secret(secret)
                .qrCodeUrl(qrCodeUrl)
                .backupCodes(backupCodes)
                .build();
    }

    @Override
    @Transactional
    public boolean verifyAndEnableTwoFactor(String username, String code) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (user.getTwoFactorSecret() == null) {
            throw new BadRequestException("2FA setup has not been initiated. Please generate a secret first.");
        }

        boolean isValid = verifyTotpCode(user.getTwoFactorSecret(), code);
        if (!isValid) {
            throw new BadRequestException("Invalid 2FA verification code");
        }

        user.setTwoFactorEnabled(true);
        userRepository.save(user);
        return true;
    }

    @Override
    @Transactional
    public void disableTwoFactor(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        userRepository.save(user);

        backupCodeRepository.deleteByUserId(user.getId());
    }

    @Override
    @Transactional
    public List<String> generateBackupCodes(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        return generateAndSaveBackupCodes(user);
    }

    @Override
    @Transactional
    public boolean verifyTwoFactorCode(User user, String code) {
        if (code == null || code.isBlank()) return false;
        String cleanCode = code.trim().toUpperCase();

        // 1. Try TOTP code
        if (user.getTwoFactorSecret() != null && cleanCode.matches("^\\d{6}$")) {
            if (verifyTotpCode(user.getTwoFactorSecret(), cleanCode)) {
                return true;
            }
        }

        // 2. Try one-time backup code
        var backupCodeOpt = backupCodeRepository.findByUserIdAndCodeAndUsedFalse(user.getId(), cleanCode);
        if (backupCodeOpt.isPresent()) {
            TwoFactorBackupCode backupCode = backupCodeOpt.get();
            backupCode.setUsed(true);
            backupCode.setUsedAt(LocalDateTime.now());
            backupCodeRepository.save(backupCode);
            return true;
        }

        return false;
    }

    private List<String> generateAndSaveBackupCodes(User user) {
        backupCodeRepository.deleteByUserId(user.getId());

        List<String> codes = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            byte[] bytes = new byte[4];
            random.nextBytes(bytes);
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02X", b));
            }
            String code = sb.substring(0, 8);
            codes.add(code);

            backupCodeRepository.save(TwoFactorBackupCode.builder()
                    .user(user)
                    .code(code)
                    .used(false)
                    .build());
        }
        return codes;
    }

    private boolean verifyTotpCode(String secret, String code) {
        try {
            long timeWindow = Instant.now().getEpochSecond() / 30;
            // Check current window and +/- 1 window for clock drift tolerance
            for (long i = -1; i <= 1; i++) {
                String expected = calculateTotp(secret, timeWindow + i);
                if (expected.equals(code)) {
                    return true;
                }
            }
        } catch (Exception e) {
            log.error("Failed to verify TOTP code", e);
        }
        return false;
    }

    private String calculateTotp(String secret, long timeStep) throws Exception {
        byte[] data = ByteBuffer.allocate(8).putLong(timeStep).array();
        byte[] key = secret.getBytes(StandardCharsets.UTF_8);

        Mac mac = Mac.getInstance("HmacSHA1");
        mac.init(new SecretKeySpec(key, "HmacSHA1"));
        byte[] hash = mac.doFinal(data);

        int offset = hash[hash.length - 1] & 0xF;
        long truncatedHash = 0;
        for (int i = 0; i < 4; ++i) {
            truncatedHash <<= 8;
            truncatedHash |= (hash[offset + i] & 0xFF);
        }
        truncatedHash &= 0x7FFFFFFF;
        truncatedHash %= 1000000;

        return String.format("%06d", truncatedHash);
    }
}
