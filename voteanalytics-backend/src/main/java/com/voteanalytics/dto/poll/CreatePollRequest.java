package com.voteanalytics.dto.poll;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePollRequest {

    @NotBlank(message = "Poll question is required")
    private String question;

    @NotNull(message = "Poll options are required")
    @Size(min = 2, max = 10, message = "Poll must have between 2 and 10 options")
    private List<String> options;

    @NotNull(message = "Poll deadline is required")
    @Future(message = "Deadline must be in the future")
    private LocalDateTime deadline;

    private String category;

    private List<String> tags;

    private Boolean isAnonymous;
}
