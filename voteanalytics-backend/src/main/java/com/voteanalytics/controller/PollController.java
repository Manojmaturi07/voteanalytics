package com.voteanalytics.controller;

import com.voteanalytics.dto.common.ApiResponse;
import com.voteanalytics.dto.poll.CreatePollRequest;
import com.voteanalytics.dto.poll.PollDto;
import com.voteanalytics.dto.poll.UpdatePollRequest;
import com.voteanalytics.service.PollService;
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
@RequestMapping("/polls")
@RequiredArgsConstructor
@Tag(name = "Polls Management", description = "Poll creation, retrieval, updates, and moderation")
public class PollController {

    private final PollService pollService;

    @GetMapping
    @Operation(summary = "Get all active published polls for voter discovery")
    public ResponseEntity<ApiResponse<List<PollDto>>> getAllPublishedPolls(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        List<PollDto> polls = pollService.getAllPublishedPolls(username);
        return ResponseEntity.ok(ApiResponse.ok(polls));
    }

    @GetMapping("/{pollId}")
    @Operation(summary = "Get single poll details by ID")
    public ResponseEntity<ApiResponse<PollDto>> getPollById(@PathVariable Long pollId, Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        PollDto poll = pollService.getPollById(pollId, username);
        return ResponseEntity.ok(ApiResponse.ok(poll));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new poll (Admin only)")
    public ResponseEntity<ApiResponse<PollDto>> createPoll(@Valid @RequestBody CreatePollRequest request,
                                                           Authentication authentication) {
        PollDto poll = pollService.createPoll(request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Poll created successfully", poll));
    }

    @PutMapping("/{pollId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update poll (Creator Admin only)")
    public ResponseEntity<ApiResponse<PollDto>> updatePoll(@PathVariable Long pollId,
                                                           @RequestBody UpdatePollRequest request,
                                                           Authentication authentication) {
        PollDto poll = pollService.updatePoll(pollId, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Poll updated successfully", poll));
    }

    @DeleteMapping("/{pollId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete poll (Creator Admin only)")
    public ResponseEntity<ApiResponse<Void>> deletePoll(@PathVariable Long pollId,
                                                        Authentication authentication) {
        pollService.deletePoll(pollId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Poll deleted successfully", null));
    }

    @GetMapping("/admin/my-polls")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get polls created by current admin (Multi-tenant Admin isolation)")
    public ResponseEntity<ApiResponse<List<PollDto>>> getAdminPolls(Authentication authentication) {
        List<PollDto> polls = pollService.getAdminPolls(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(polls));
    }

    @PatchMapping("/{pollId}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Publish poll (Creator Admin only)")
    public ResponseEntity<ApiResponse<PollDto>> publishPoll(@PathVariable Long pollId,
                                                           Authentication authentication) {
        PollDto poll = pollService.setPublishStatus(pollId, true, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Poll published successfully", poll));
    }

    @PatchMapping("/{pollId}/unpublish")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Unpublish poll (Creator Admin only)")
    public ResponseEntity<ApiResponse<PollDto>> unpublishPoll(@PathVariable Long pollId,
                                                             Authentication authentication) {
        PollDto poll = pollService.setPublishStatus(pollId, false, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Poll unpublished successfully", poll));
    }
}
