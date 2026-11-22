package com.voteanalytics.dto.vote;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoteDetailDto {
    private Long userId;
    private String username;
    private String name;
    private Long optionId;
    private String optionText;
    private LocalDateTime votedAt;
}
