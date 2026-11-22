package com.voteanalytics.dto.analytics;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDistributionDto {
    private List<String> labels;
    private List<Long> values;
}
