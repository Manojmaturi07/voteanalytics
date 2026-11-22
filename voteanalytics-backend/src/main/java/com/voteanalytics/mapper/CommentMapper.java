package com.voteanalytics.mapper;

import com.voteanalytics.dto.comment.CommentDto;
import com.voteanalytics.entity.Comment;
import org.springframework.stereotype.Component;

@Component
public class CommentMapper {

    public CommentDto toDto(Comment comment) {
        if (comment == null) return null;

        return CommentDto.builder()
                .id(comment.getId())
                .pollId(comment.getPoll() != null ? comment.getPoll().getId() : null)
                .text(comment.getCommentText())
                .author(comment.getUser() != null ? comment.getUser().getName() : "Anonymous")
                .username(comment.getUser() != null ? comment.getUser().getUsername() : "anonymous")
                .userId(comment.getUser() != null ? comment.getUser().getId() : null)
                .timestamp(comment.getCreatedAt())
                .likes(0)
                .build();
    }
}
