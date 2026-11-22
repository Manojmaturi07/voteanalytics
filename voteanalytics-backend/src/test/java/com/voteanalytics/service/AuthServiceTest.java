package com.voteanalytics.service;

import com.voteanalytics.dto.auth.AuthResponse;
import com.voteanalytics.dto.auth.LoginRequest;
import com.voteanalytics.dto.auth.RegisterRequest;
import com.voteanalytics.entity.User;
import com.voteanalytics.enums.Role;
import com.voteanalytics.exception.DuplicateResourceException;
import com.voteanalytics.exception.UnauthorizedException;
import com.voteanalytics.mapper.UserMapper;
import com.voteanalytics.repository.RefreshTokenRepository;
import com.voteanalytics.repository.UserRepository;
import com.voteanalytics.security.JwtTokenProvider;
import com.voteanalytics.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private UserMapper userMapper;

    @Mock
    private EmailService emailService;

    @Mock
    private TwoFactorService twoFactorService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .username("test_user")
                .email("test@example.com")
                .password("encoded_pass")
                .name("Test User")
                .role(Role.USER)
                .isActive(true)
                .isEmailVerified(true)
                .twoFactorEnabled(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void register_Success() {
        RegisterRequest request = RegisterRequest.builder()
                .username("new_user")
                .email("new@example.com")
                .password("password123")
                .name("New User")
                .build();

        when(userRepository.existsByUsername("new_user")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(tokenProvider.generateTokenFromUser(any(), any(), any(), any(), any())).thenReturn("mock-jwt-token");
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("mock-jwt-token", response.getToken());
        verify(emailService, times(1)).sendVerificationEmail(any(User.class));
    }

    @Test
    void register_ThrowsWhenUsernameExists() {
        RegisterRequest request = RegisterRequest.builder()
                .username("test_user")
                .email("test@example.com")
                .password("password123")
                .name("Test User")
                .build();

        when(userRepository.existsByUsername("test_user")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_Success() {
        LoginRequest request = LoginRequest.builder()
                .username("test_user")
                .password("password123")
                .build();

        when(userRepository.findByUsername("test_user")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("password123", "encoded_pass")).thenReturn(true);
        when(tokenProvider.generateTokenFromUser(any(), any(), any(), any(), any())).thenReturn("mock-jwt-token");
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("mock-jwt-token", response.getToken());
    }

    @Test
    void login_ThrowsWhenPasswordInvalid() {
        LoginRequest request = LoginRequest.builder()
                .username("test_user")
                .password("wrongpassword")
                .build();

        when(userRepository.findByUsername("test_user")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongpassword", "encoded_pass")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }
}
