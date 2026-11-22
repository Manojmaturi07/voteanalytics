package com.voteanalytics.dto.user;

import com.voteanalytics.enums.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String name;
    private Role role;
    private Boolean isActive;
    private Boolean isEmailVerified;
    private Boolean twoFactorEnabled;
    private LocalDateTime createdAt;
}
