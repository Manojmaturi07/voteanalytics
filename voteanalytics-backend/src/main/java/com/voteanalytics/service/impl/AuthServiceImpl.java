package com.voteanalytics.service.impl;

import com.voteanalytics.dto.auth.*;
import com.voteanalytics.dto.user.UserDto;
import com.voteanalytics.entity.RefreshToken;
import com.voteanalytics.entity.User;
import com.voteanalytics.enums.Role;
import com.voteanalytics.exception.BadRequestException;
import com.voteanalytics.exception.DuplicateResourceException;
import com.voteanalytics.exception.ResourceNotFoundException;
import com.voteanalytics.exception.UnauthorizedException;
import com.voteanalytics.mapper.UserMapper;
import com.voteanalytics.repository.RefreshTokenRepository;
import com.voteanalytics.repository.UserRepository;
import com.voteanalytics.security.JwtTokenProvider;
import com.voteanalytics.service.AuthService;
import com.voteanalytics.service.EmailService;
import com.voteanalytics.service.TwoFactorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;
    private final EmailService emailService;
    private final TwoFactorService twoFactorService;

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        return registerInternal(request, Role.USER);
    }

    @Override
    @Transactional
    public AuthResponse adminRegister(RegisterRequest request) {
        return registerInternal(request, Role.ADMIN);
    }

    private AuthResponse registerInternal(RegisterRequest request, Role role) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            throw new DuplicateResourceException("Username is already taken");
        }
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email is already registered");
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName().trim())
                .role(role)
                .isActive(true)
                .isEmailVerified(false)
                .twoFactorEnabled(false)
                .build();

        user = userRepository.save(user);

        // Send email verification asynchronously
        emailService.sendVerificationEmail(user);

        String token = tokenProvider.generateTokenFromUser(user.getId(), user.getUsername(), user.getEmail(), user.getName(), user.getRole().name());
        RefreshToken refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .success(true)
                .token(token)
                .refreshToken(refreshToken.getToken())
                .user(userMapper.toDto(user))
                .requiresTwoFactor(false)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String username = request.getUsername().trim();

        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username.toLowerCase()))
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new UnauthorizedException("This account has been deactivated. Please contact support.");
        }

        // Check 2FA if enabled
        if (Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
            if (request.getTwoFactorCode() == null || request.getTwoFactorCode().isBlank()) {
                return AuthResponse.builder()
                        .success(false)
                        .requiresTwoFactor(true)
                        .user(userMapper.toDto(user))
                        .build();
            }

            boolean is2faValid = twoFactorService.verifyTwoFactorCode(user, request.getTwoFactorCode().trim());
            if (!is2faValid) {
                throw new UnauthorizedException("Invalid 2FA verification code");
            }
        }

        String token = tokenProvider.generateTokenFromUser(user.getId(), user.getUsername(), user.getEmail(), user.getName(), user.getRole().name());
        RefreshToken refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .success(true)
                .token(token)
                .refreshToken(refreshToken.getToken())
                .user(userMapper.toDto(user))
                .requiresTwoFactor(false)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (refreshToken.isExpired() || Boolean.TRUE.equals(refreshToken.getRevoked())) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token was expired or revoked. Please login again.");
        }

        User user = refreshToken.getUser();
        String newToken = tokenProvider.generateTokenFromUser(user.getId(), user.getUsername(), user.getEmail(), user.getName(), user.getRole().name());

        return AuthResponse.builder()
                .success(true)
                .token(newToken)
                .refreshToken(refreshToken.getToken())
                .user(userMapper.toDto(user))
                .build();
    }

    @Override
    @Transactional
    public void logout(String username) {
        userRepository.findByUsername(username).ifPresent(refreshTokenRepository::deleteByUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return userMapper.toDto(user);
    }

    @Override
    @Transactional
    public UserDto updateProfile(String username, ProfileUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        String newEmail = request.getEmail().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(newEmail)) {
            if (userRepository.existsByEmail(newEmail)) {
                throw new DuplicateResourceException("Email address is already in use by another account");
            }
            user.setEmail(newEmail);
            user.setIsEmailVerified(false);
            emailService.sendVerificationEmail(user);
        }

        user.setName(request.getName().trim());
        user = userRepository.save(user);

        return userMapper.toDto(user);
    }

    @Override
    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        if (request.getNewPassword().length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters long");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private RefreshToken createRefreshToken(User user) {
        refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshExpirationMs))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }
}
