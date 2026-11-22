package com.voteanalytics.service.impl;

import com.voteanalytics.dto.comment.CommentDto;
import com.voteanalytics.dto.comment.CreateCommentRequest;
import com.voteanalytics.entity.Comment;
import com.voteanalytics.entity.Poll;
import com.voteanalytics.entity.User;
import com.voteanalytics.exception.ForbiddenException;
import com.voteanalytics.exception.ResourceNotFoundException;
import com.voteanalytics.mapper.CommentMapper;
import com.voteanalytics.repository.CommentRepository;
import com.voteanalytics.repository.PollRepository;
import com.voteanalytics.repository.UserRepository;
import com.voteanalytics.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PollRepository pollRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CommentDto> getComments(Long pollId) {
        List<Comment> comments = commentRepository.findByPollIdOrderByCreatedAtDesc(pollId);
        return comments.stream().map(commentMapper::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CommentDto addComment(Long pollId, CreateCommentRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with id: " + pollId));

        Comment comment = Comment.builder()
                .poll(poll)
                .user(user)
                .commentText(request.getText().trim())
                .build();

        comment = commentRepository.save(comment);
        return commentMapper.toDto(comment);
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, String username, boolean isAdmin) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!isAdmin && !comment.getUser().getUsername().equalsIgnoreCase(username)) {
            throw new ForbiddenException("Unauthorized: You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }
}
