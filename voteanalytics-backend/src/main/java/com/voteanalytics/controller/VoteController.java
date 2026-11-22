package com.voteanalytics.controller;

import com.voteanalytics.dto.common.ApiResponse;
import com.voteanalytics.dto.poll.PollDto;
import com.voteanalytics.dto.vote.VoteDetailDto;
import com.voteanalytics.dto.vote.VoteRequest;
import com.voteanalytics.service.VoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Voting Engine", description = "Vote casting, vote status, and voter audit details")
public class VoteController {

    private final VoteService voteService;

    @PostMapping("/polls/{pollId}/vote")
    @Operation(summary = "Cast a vote on a poll")
    public ResponseEntity<ApiResponse<PollDto>> castVote(@PathVariable Long pollId,
                                                         @Valid @RequestBody VoteRequest request,
                                                         Authentication authentication) {
        PollDto poll = voteService.castVote(pollId, request.getOptionId(), authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Vote recorded successfully", poll));
    }

    @GetMapping("/polls/{pollId}/has-voted")
    @Operation(summary = "Check if current user has voted on poll")
    public ResponseEntity<ApiResponse<Boolean>> hasVoted(@PathVariable Long pollId,
                                                         Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        boolean voted = voteService.hasVoted(pollId, username);
        return ResponseEntity.ok(ApiResponse.ok(voted));
    }

    @GetMapping("/polls/{pollId}/results")
    @Operation(summary = "Get aggregated voting results for a poll")
    public ResponseEntity<ApiResponse<PollDto>> getPollResults(@PathVariable Long pollId,
                                                               Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        PollDto poll = voteService.getPollResults(pollId, username);
        return ResponseEntity.ok(ApiResponse.ok(poll));
    }

    @GetMapping("/polls/{pollId}/voting-details")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get individual voter details (Creator Admin only)")
    public ResponseEntity<ApiResponse<List<VoteDetailDto>>> getVotingDetails(@PathVariable Long pollId,
                                                                             Authentication authentication) {
        List<VoteDetailDto> details = voteService.getVotingDetails(pollId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(details));
    }

    @GetMapping("/users/my-votes")
    @Operation(summary = "Get polls voted on by current user")
    public ResponseEntity<ApiResponse<List<PollDto>>> getMyVotes(Authentication authentication) {
        List<PollDto> polls = voteService.getMyVotes(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(polls));
    }
}
