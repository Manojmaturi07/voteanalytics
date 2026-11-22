package com.voteanalytics.mapper;

import com.voteanalytics.dto.poll.PollDto;
import com.voteanalytics.dto.poll.PollOptionDto;
import com.voteanalytics.entity.Poll;
import com.voteanalytics.entity.PollOption;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PollMapper {

    public PollDto toDto(Poll poll, Boolean hasVoted) {
        if (poll == null) return null;

        int totalVotes = poll.getOptions() != null
                ? poll.getOptions().stream().mapToInt(opt -> opt.getVoteCount() != null ? opt.getVoteCount() : 0).sum()
                : 0;

        List<PollOptionDto> optionDtos = poll.getOptions() != null
                ? poll.getOptions().stream().map(opt -> toOptionDto(opt, totalVotes)).collect(Collectors.toList())
                : Collections.emptyList();

        List<String> tagsList = poll.getTags() != null && !poll.getTags().isBlank()
                ? Arrays.stream(poll.getTags().split(",")).map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList())
                : Collections.emptyList();

        return PollDto.builder()
                .id(poll.getId())
                .question(poll.getQuestion())
                .options(optionDtos)
                .deadline(poll.getDeadline())
                .isLocked(poll.getIsLocked() || poll.isExpired())
                .isPublished(poll.getIsPublished())
                .isAnonymous(poll.getIsAnonymous())
                .category(poll.getCategory())
                .tags(tagsList)
                .createdAt(poll.getCreatedAt())
                .createdBy(poll.getCreatedBy() != null ? poll.getCreatedBy().getId() : null)
                .createdByName(poll.getCreatedBy() != null ? poll.getCreatedBy().getName() : "Administrator")
                .totalVotes(totalVotes)
                .hasVoted(hasVoted)
                .build();
    }

    public PollOptionDto toOptionDto(PollOption option, int totalVotes) {
        if (option == null) return null;

        int votes = option.getVoteCount() != null ? option.getVoteCount() : 0;
        double percentage = totalVotes > 0 ? Math.round(((double) votes / totalVotes) * 1000.0) / 10.0 : 0.0;

        return PollOptionDto.builder()
                .id(option.getId())
                .text(option.getOptionText())
                .votes(votes)
                .percentage(percentage)
                .build();
    }
}
