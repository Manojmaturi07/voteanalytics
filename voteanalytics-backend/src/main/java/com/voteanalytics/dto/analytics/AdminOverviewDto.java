package com.voteanalytics.dto.analytics;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminOverviewDto {
    private long totalPolls;
    private long totalVotes;
    private long activePolls;
    private long completedPolls;
    private long totalUsers;
}
