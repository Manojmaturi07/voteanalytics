package com.voteanalytics.controller;

import com.voteanalytics.dto.common.ApiResponse;
import com.voteanalytics.dto.user.UserDto;
import com.voteanalytics.service.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin User Management", description = "Admin user list, status toggle, and account deletion")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @Operation(summary = "Get all registered users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = adminUserService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long userId) {
        UserDto user = adminUserService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PatchMapping("/{userId}/status")
    @Operation(summary = "Toggle user active status")
    public ResponseEntity<ApiResponse<UserDto>> toggleUserStatus(@PathVariable Long userId) {
        UserDto user = adminUserService.toggleUserStatus(userId);
        return ResponseEntity.ok(ApiResponse.ok("User status updated", user));
    }

    @DeleteMapping("/{userId}")
    @Operation(summary = "Delete user account")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        adminUserService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.ok("User deleted successfully", null));
    }
}
