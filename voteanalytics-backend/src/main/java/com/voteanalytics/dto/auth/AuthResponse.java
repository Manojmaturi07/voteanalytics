package com.voteanalytics.dto.auth;

import com.voteanalytics.dto.user.UserDto;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    @Builder.Default
    private boolean success = true;
    private String token;
    private String refreshToken;
    private UserDto user;
    private boolean requiresTwoFactor;
}
