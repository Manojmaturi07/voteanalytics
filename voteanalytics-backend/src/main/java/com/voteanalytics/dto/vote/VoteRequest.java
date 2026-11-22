package com.voteanalytics.dto.vote;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VoteRequest {
    @NotNull(message = "Option ID is required")
    private Long optionId;
}
