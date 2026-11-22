package com.voteanalytics.controller;

import com.voteanalytics.dto.comment.CommentDto;
import com.voteanalytics.dto.comment.CreateCommentRequest;
import com.voteanalytics.dto.common.ApiResponse;
import com.voteanalytics.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Poll Comments", description = "Comments discussion and moderation on polls")
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/polls/{pollId}/comments")
    @Operation(summary = "Get comments for a poll (newest first)")
    public ResponseEntity<ApiResponse<List<CommentDto>>> getComments(@PathVariable Long pollId) {
        List<CommentDto> comments = commentService.getComments(pollId);
        return ResponseEntity.ok(ApiResponse.ok(comments));
    }

    @PostMapping("/polls/{pollId}/comments")
    @Operation(summary = "Post a comment on a poll")
    public ResponseEntity<ApiResponse<CommentDto>> addComment(@PathVariable Long pollId,
                                                              @Valid @RequestBody CreateCommentRequest request,
                                                              Authentication authentication) {
        CommentDto comment = commentService.addComment(pollId, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Comment posted successfully", comment));
    }

    @DeleteMapping("/comments/{commentId}")
    @Operation(summary = "Delete comment (Author or Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long commentId,
                                                           Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        commentService.deleteComment(commentId, authentication.getName(), isAdmin);
        return ResponseEntity.ok(ApiResponse.ok("Comment deleted successfully", null));
    }
}
