package com.voteanalytics.controller;

import com.voteanalytics.dto.auth.*;
import com.voteanalytics.dto.common.ApiResponse;
import com.voteanalytics.dto.user.UserDto;
import com.voteanalytics.service.AuthService;
import com.voteanalytics.service.EmailService;
import com.voteanalytics.service.TwoFactorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & Security", description = "User registration, authentication, 2FA, and verification")
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService;
    private final TwoFactorService twoFactorService;

    @PostMapping("/register")
    @Operation(summary = "Register standard voter user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/admin/register")
    @Operation(summary = "Register administrator account")
    public ResponseEntity<AuthResponse> adminRegister(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.adminRegister(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Login user or admin and obtain JWT")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user and invalidate session")
    public ResponseEntity<ApiResponse<String>> logout(Authentication authentication) {
        if (authentication != null) {
            authService.logout(authentication.getName());
        }
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully", null));
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user details")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(Authentication authentication) {
        UserDto userDto = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(userDto));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(Authentication authentication,
                                                              @Valid @RequestBody ProfileUpdateRequest request) {
        UserDto userDto = authService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", userDto));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change account password")
    public ResponseEntity<ApiResponse<Void>> changePassword(Authentication authentication,
                                                            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Verify account email with token")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam("token") String token) {
        emailService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.ok("Email verified successfully", "Verified"));
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend email verification link")
    public ResponseEntity<ApiResponse<Void>> resendVerification(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        emailService.resendVerification(email);
        return ResponseEntity.ok(ApiResponse.ok("Verification email sent", null));
    }

    @PostMapping("/2fa/setup")
    @Operation(summary = "Setup two-factor authentication")
    public ResponseEntity<ApiResponse<TwoFactorSetupResponse>> setupTwoFactor(Authentication authentication) {
        TwoFactorSetupResponse response = twoFactorService.setupTwoFactor(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/2fa/verify")
    @Operation(summary = "Verify code and activate 2FA")
    public ResponseEntity<ApiResponse<Boolean>> verifyTwoFactor(Authentication authentication,
                                                                @Valid @RequestBody TwoFactorVerifyRequest request) {
        boolean success = twoFactorService.verifyAndEnableTwoFactor(authentication.getName(), request.getCode());
        return ResponseEntity.ok(ApiResponse.ok("Two-factor authentication enabled", success));
    }

    @PostMapping("/2fa/disable")
    @Operation(summary = "Disable two-factor authentication")
    public ResponseEntity<ApiResponse<Void>> disableTwoFactor(Authentication authentication) {
        twoFactorService.disableTwoFactor(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Two-factor authentication disabled", null));
    }

    @PostMapping("/2fa/backup-codes")
    @Operation(summary = "Generate new 2FA backup codes")
    public ResponseEntity<ApiResponse<List<String>>> generateBackupCodes(Authentication authentication) {
        List<String> codes = twoFactorService.generateBackupCodes(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(codes));
    }
}
