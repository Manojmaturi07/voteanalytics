package com.voteanalytics.dto.poll;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePollRequest {
    private String question;
    private List<String> options;
    private LocalDateTime deadline;
    private String category;
    private List<String> tags;
    private Boolean isPublished;
}
