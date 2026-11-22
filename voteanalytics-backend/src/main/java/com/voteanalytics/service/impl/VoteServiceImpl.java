package com.voteanalytics.service.impl;

import com.voteanalytics.dto.poll.PollDto;
import com.voteanalytics.dto.vote.VoteDetailDto;
import com.voteanalytics.entity.Poll;
import com.voteanalytics.entity.PollOption;
import com.voteanalytics.entity.User;
import com.voteanalytics.entity.Vote;
import com.voteanalytics.enums.Role;
import com.voteanalytics.exception.BadRequestException;
import com.voteanalytics.exception.ForbiddenException;
import com.voteanalytics.exception.ResourceNotFoundException;
import com.voteanalytics.mapper.PollMapper;
import com.voteanalytics.repository.PollOptionRepository;
import com.voteanalytics.repository.PollRepository;
import com.voteanalytics.repository.UserRepository;
import com.voteanalytics.repository.VoteRepository;
import com.voteanalytics.service.VoteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoteServiceImpl implements VoteService {

    private final VoteRepository voteRepository;
    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final UserRepository userRepository;
    private final PollMapper pollMapper;

    @Override
    @Transactional
    public PollDto castVote(Long pollId, Long optionId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new BadRequestException("Your account is deactivated. You cannot vote.");
        }

        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with id: " + pollId));

        if (!poll.canVote()) {
            if (poll.isExpired() || Boolean.TRUE.equals(poll.getIsLocked())) {
                poll.setIsLocked(true);
                pollRepository.save(poll);
                throw new BadRequestException("This poll has expired or is locked");
            }
            if (Boolean.FALSE.equals(poll.getIsPublished())) {
                throw new BadRequestException("This poll is unpublished");
            }
        }

        // Check if user already voted
        if (voteRepository.existsByUserIdAndPollId(user.getId(), poll.getId())) {
            throw new BadRequestException("You have already voted on this poll");
        }

        PollOption option = pollOptionRepository.findById(optionId)
                .orElseThrow(() -> new ResourceNotFoundException("Option not found with id: " + optionId));

        if (!option.getPoll().getId().equals(poll.getId())) {
            throw new BadRequestException("The selected option does not belong to this poll");
        }

        // Save vote
        Vote vote = Vote.builder()
                .user(user)
                .poll(poll)
                .option(option)
                .votedAt(LocalDateTime.now())
                .build();
        voteRepository.save(vote);

        // Increment option vote count atomically
        option.setVoteCount(option.getVoteCount() + 1);
        pollOptionRepository.save(option);

        return pollMapper.toDto(poll, true);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasVoted(Long pollId, String username) {
        if (username == null) return false;
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return false;
        return voteRepository.existsByUserIdAndPollId(user.getId(), pollId);
    }

    @Override
    @Transactional(readOnly = true)
    public PollDto getPollResults(Long pollId, String currentUsername) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with id: " + pollId));

        boolean voted = hasVoted(pollId, currentUsername);
        return pollMapper.toDto(poll, voted);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VoteDetailDto> getVotingDetails(Long pollId, String adminUsername) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with id: " + pollId));

        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found: " + adminUsername));

        if (admin.getRole() != Role.ADMIN || !poll.getCreatedBy().getId().equals(admin.getId())) {
            throw new ForbiddenException("Unauthorized: You can only view voting details for polls you created");
        }

        List<Vote> votes = voteRepository.findByPollIdOrderByVotedAtDesc(pollId);

        return votes.stream().map(v -> VoteDetailDto.builder()
                .userId(v.getUser().getId())
                .username(v.getUser().getUsername())
                .name(v.getUser().getName())
                .optionId(v.getOption().getId())
                .optionText(v.getOption().getOptionText())
                .votedAt(v.getVotedAt())
                .build()
        ).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PollDto> getMyVotes(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        List<Vote> votes = voteRepository.findByUserIdOrderByVotedAtDesc(user.getId());

        return votes.stream()
                .map(Vote::getPoll)
                .distinct()
                .map(p -> pollMapper.toDto(p, true))
                .collect(Collectors.toList());
    }
}
