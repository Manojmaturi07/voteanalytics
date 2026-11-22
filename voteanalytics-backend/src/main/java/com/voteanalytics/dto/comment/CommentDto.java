package com.voteanalytics.dto.comment;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDto {
    private Long id;
    private Long pollId;
    private String text;
    private String author;
    private String username;
    private Long userId;
    private LocalDateTime timestamp;
    private Integer likes;
}
