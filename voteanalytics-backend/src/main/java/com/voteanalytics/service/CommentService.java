package com.voteanalytics.service;

import com.voteanalytics.dto.comment.CommentDto;
import com.voteanalytics.dto.comment.CreateCommentRequest;

import java.util.List;

public interface CommentService {
    List<CommentDto> getComments(Long pollId);
    CommentDto addComment(Long pollId, CreateCommentRequest request, String username);
    void deleteComment(Long commentId, String username, boolean isAdmin);
}
