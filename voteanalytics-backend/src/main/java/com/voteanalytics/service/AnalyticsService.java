package com.voteanalytics.service;

import com.voteanalytics.dto.analytics.AdminOverviewDto;
import com.voteanalytics.dto.analytics.CategoryDistributionDto;
import com.voteanalytics.dto.poll.PollDto;

import java.util.List;

public interface AnalyticsService {
    AdminOverviewDto getOverview(String adminUsername);
    List<PollDto> getPopularPolls(String adminUsername);
    CategoryDistributionDto getCategoryDistribution(String adminUsername);
}
