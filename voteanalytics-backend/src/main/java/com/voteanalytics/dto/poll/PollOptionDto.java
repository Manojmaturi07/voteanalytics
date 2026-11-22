package com.voteanalytics.dto.poll;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PollOptionDto {
    private Long id;
    private String text;
    private Integer votes;
    private Double percentage;
}
