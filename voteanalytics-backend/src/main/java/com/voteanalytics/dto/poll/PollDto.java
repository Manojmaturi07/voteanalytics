package com.voteanalytics.dto.poll;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PollDto {
    private Long id;
    private String question;
    private List<PollOptionDto> options;
    private LocalDateTime deadline;
    private Boolean isLocked;
    private Boolean isPublished;
    private Boolean isAnonymous;
    private String category;
    private List<String> tags;
    private LocalDateTime createdAt;
    private Long createdBy;
    private String createdByName;
    private Integer totalVotes;
    private Boolean hasVoted;
}
