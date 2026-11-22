package com.voteanalytics.service;

import com.voteanalytics.dto.user.UserDto;

import java.util.List;

public interface AdminUserService {
    List<UserDto> getAllUsers();
    UserDto getUserById(Long userId);
    UserDto toggleUserStatus(Long userId);
    void deleteUser(Long userId);
}
