package com.voteanalytics.controller;

import com.voteanalytics.dto.analytics.AdminOverviewDto;
import com.voteanalytics.dto.analytics.CategoryDistributionDto;
import com.voteanalytics.dto.common.ApiResponse;
import com.voteanalytics.dto.poll.PollDto;
import com.voteanalytics.dto.vote.VoteDetailDto;
import com.voteanalytics.service.AnalyticsService;
import com.voteanalytics.service.VoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Analytics", description = "Admin-scoped poll and voting analytics")
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;
    private final VoteService voteService;

    @GetMapping("/overview")
    @Operation(summary = "Get admin dashboard overview metrics (Admin-isolated)")
    public ResponseEntity<ApiResponse<AdminOverviewDto>> getOverview(Authentication authentication) {
        AdminOverviewDto overview = analyticsService.getOverview(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(overview));
    }

    @GetMapping("/popular-polls")
    @Operation(summary = "Get top 5 popular polls by vote count (Admin-isolated)")
    public ResponseEntity<ApiResponse<List<PollDto>>> getPopularPolls(Authentication authentication) {
        List<PollDto> polls = analyticsService.getPopularPolls(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(polls));
    }

    @GetMapping("/category-distribution")
    @Operation(summary = "Get category-wise poll count distribution (Admin-isolated)")
    public ResponseEntity<ApiResponse<CategoryDistributionDto>> getCategoryDistribution(Authentication authentication) {
        CategoryDistributionDto distribution = analyticsService.getCategoryDistribution(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(distribution));
    }

    @GetMapping("/poll/{pollId}/results")
    @Operation(summary = "Get poll results for analytics")
    public ResponseEntity<ApiResponse<PollDto>> getPollResults(@PathVariable Long pollId,
                                                               Authentication authentication) {
        PollDto results = voteService.getPollResults(pollId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @GetMapping("/poll/{pollId}/voting-details")
    @Operation(summary = "Get detailed voter list for a poll (Creator Admin only)")
    public ResponseEntity<ApiResponse<List<VoteDetailDto>>> getPollVotingDetails(@PathVariable Long pollId,
                                                                                 Authentication authentication) {
        List<VoteDetailDto> details = voteService.getVotingDetails(pollId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(details));
    }
}
