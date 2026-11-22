package com.voteanalytics.service.impl;

import com.voteanalytics.dto.poll.CreatePollRequest;
import com.voteanalytics.dto.poll.PollDto;
import com.voteanalytics.dto.poll.UpdatePollRequest;
import com.voteanalytics.entity.Poll;
import com.voteanalytics.entity.PollOption;
import com.voteanalytics.entity.User;
import com.voteanalytics.exception.BadRequestException;
import com.voteanalytics.exception.ForbiddenException;
import com.voteanalytics.exception.ResourceNotFoundException;
import com.voteanalytics.mapper.PollMapper;
import com.voteanalytics.repository.PollOptionRepository;
import com.voteanalytics.repository.PollRepository;
import com.voteanalytics.repository.UserRepository;
import com.voteanalytics.repository.VoteRepository;
import com.voteanalytics.service.EmailService;
import com.voteanalytics.service.PollService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PollServiceImpl implements PollService {

    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final UserRepository userRepository;
    private final VoteRepository voteRepository;
    private final PollMapper pollMapper;
    private final EmailService emailService;

    @Override
    @Transactional(readOnly = true)
    public List<PollDto> getAllPublishedPolls(String currentUsername) {
        LocalDateTime now = LocalDateTime.now();
        List<Poll> polls = pollRepository.findByIsPublishedTrueAndIsLockedFalseAndDeadlineAfterOrderByCreatedAtDesc(now);

        Long currentUserId = getUserIdOrNull(currentUsername);

        return polls.stream()
                .map(p -> {
                    boolean hasVoted = currentUserId != null && voteRepository.existsByUserIdAndPollId(currentUserId, p.getId());
                    return pollMapper.toDto(p, hasVoted);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PollDto> getAdminPolls(String adminUsername) {
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found: " + adminUsername));

        List<Poll> polls = pollRepository.findAllByCreatedByOrderByCreatedAtDesc(admin);

        return polls.stream()
                .map(p -> pollMapper.toDto(p, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PollDto getPollById(Long pollId, String currentUsername) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with id: " + pollId));

        Long currentUserId = getUserIdOrNull(currentUsername);
        boolean hasVoted = currentUserId != null && voteRepository.existsByUserIdAndPollId(currentUserId, poll.getId());

        return pollMapper.toDto(poll, hasVoted);
    }

    @Override
    @Transactional
    public PollDto createPoll(CreatePollRequest request, String adminUsername) {
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found: " + adminUsername));

        if (request.getOptions() == null || request.getOptions().size() < 2) {
            throw new BadRequestException("A poll must contain at least 2 options");
        }

        String tagsStr = request.getTags() != null ? String.join(", ", request.getTags()) : null;

        Poll poll = Poll.builder()
                .question(request.getQuestion().trim())
                .deadline(request.getDeadline())
                .isLocked(false)
                .isPublished(true)
                .isAnonymous(Boolean.TRUE.equals(request.getIsAnonymous()))
                .category(request.getCategory() != null ? request.getCategory().trim() : null)
                .tags(tagsStr)
                .createdBy(admin)
                .options(new ArrayList<>())
                .build();

        for (String optText : request.getOptions()) {
            if (optText != null && !optText.trim().isEmpty()) {
                poll.addOption(PollOption.builder()
                        .optionText(optText.trim())
                        .voteCount(0)
                        .build());
            }
        }

        poll = pollRepository.save(poll);

        // Notify registered users via email
        try {
            List<String> userEmails = userRepository.findAll().stream()
                    .map(User::getEmail)
                    .collect(Collectors.toList());
            emailService.sendNewPollNotification(poll, userEmails);
        } catch (Exception e) {
            log.warn("Failed to notify users about new poll: {}", e.getMessage());
        }

        return pollMapper.toDto(poll, false);
    }

    @Override
    @Transactional
    public PollDto updatePoll(Long pollId, UpdatePollRequest request, String adminUsername) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with id: " + pollId));

        assertPollOwnership(poll, adminUsername);

        if (request.getQuestion() != null && !request.getQuestion().isBlank()) {
            poll.setQuestion(request.getQuestion().trim());
        }
        if (request.getDeadline() != null) {
            poll.setDeadline(request.getDeadline());
        }
        if (request.getCategory() != null) {
            poll.setCategory(request.getCategory().trim());
        }
        if (request.getTags() != null) {
            poll.setTags(String.join(", ", request.getTags()));
        }
        if (request.getIsPublished() != null) {
            poll.setIsPublished(request.getIsPublished());
        }

        // If new options are provided, update matching options
        if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            List<PollOption> existingOptions = poll.getOptions();
            for (int i = 0; i < request.getOptions().size(); i++) {
                String newText = request.getOptions().get(i);
                if (i < existingOptions.size()) {
                    existingOptions.get(i).setOptionText(newText.trim());
                } else {
                    poll.addOption(PollOption.builder()
                            .optionText(newText.trim())
                            .voteCount(0)
                            .build());
                }
            }
        }

        poll = pollRepository.save(poll);
        return pollMapper.toDto(poll, false);
    }

    @Override
    @Transactional
    public void deletePoll(Long pollId, String adminUsername) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with id: " + pollId));

        assertPollOwnership(poll, adminUsername);
        pollRepository.delete(poll);
    }

    @Override
    @Transactional
    public PollDto setPublishStatus(Long pollId, boolean publish, String adminUsername) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with id: " + pollId));

        assertPollOwnership(poll, adminUsername);
        poll.setIsPublished(publish);
        poll = pollRepository.save(poll);
        return pollMapper.toDto(poll, false);
    }

    private void assertPollOwnership(Poll poll, String adminUsername) {
        if (!poll.getCreatedBy().getUsername().equalsIgnoreCase(adminUsername)) {
            throw new ForbiddenException("Unauthorized: You can only modify polls you created");
        }
    }

    private Long getUserIdOrNull(String username) {
        if (username == null) return null;
        return userRepository.findByUsername(username).map(User::getId).orElse(null);
    }
}
