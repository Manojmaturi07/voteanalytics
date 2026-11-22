package com.voteanalytics.service;

import com.voteanalytics.dto.auth.*;
import com.voteanalytics.dto.user.UserDto;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse adminRegister(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    void logout(String username);
    UserDto getCurrentUser(String username);
    UserDto updateProfile(String username, ProfileUpdateRequest request);
    void changePassword(String username, ChangePasswordRequest request);
}
