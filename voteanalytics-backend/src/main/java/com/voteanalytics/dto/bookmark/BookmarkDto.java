package com.voteanalytics.dto.bookmark;

import com.voteanalytics.dto.poll.PollDto;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkDto {
    private Long id;
    private Long pollId;
    private PollDto poll;
    private LocalDateTime createdAt;
}
