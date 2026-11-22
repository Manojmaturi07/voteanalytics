package com.voteanalytics.service;

import com.voteanalytics.dto.poll.PollDto;
import com.voteanalytics.entity.Poll;
import com.voteanalytics.entity.PollOption;
import com.voteanalytics.entity.User;
import com.voteanalytics.enums.Role;
import com.voteanalytics.exception.BadRequestException;
import com.voteanalytics.mapper.PollMapper;
import com.voteanalytics.repository.PollOptionRepository;
import com.voteanalytics.repository.PollRepository;
import com.voteanalytics.repository.UserRepository;
import com.voteanalytics.repository.VoteRepository;
import com.voteanalytics.service.impl.VoteServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VoteServiceTest {

    @Mock
    private VoteRepository voteRepository;

    @Mock
    private PollRepository pollRepository;

    @Mock
    private PollOptionRepository pollOptionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PollMapper pollMapper;

    @InjectMocks
    private VoteServiceImpl voteService;

    private User voter;
    private Poll activePoll;
    private PollOption option1;

    @BeforeEach
    void setUp() {
        voter = User.builder().id(5L).username("voter1").role(Role.USER).isActive(true).build();

        activePoll = Poll.builder()
                .id(1L)
                .question("Test Question")
                .deadline(LocalDateTime.now().plusDays(2))
                .isLocked(false)
                .isPublished(true)
                .options(new ArrayList<>())
                .build();

        option1 = PollOption.builder()
                .id(101L)
                .optionText("Yes")
                .poll(activePoll)
                .voteCount(5)
                .build();
    }

    @Test
    void castVote_SuccessIncrementsVoteCount() {
        when(userRepository.findByUsername("voter1")).thenReturn(Optional.of(voter));
        when(pollRepository.findById(1L)).thenReturn(Optional.of(activePoll));
        when(voteRepository.existsByUserIdAndPollId(5L, 1L)).thenReturn(false);
        when(pollOptionRepository.findById(101L)).thenReturn(Optional.of(option1));
        when(pollMapper.toDto(any(), eq(true))).thenReturn(PollDto.builder().id(1L).hasVoted(true).build());

        PollDto result = voteService.castVote(1L, 101L, "voter1");

        assertNotNull(result);
        assertEquals(6, option1.getVoteCount());
        verify(voteRepository, times(1)).save(any());
        verify(pollOptionRepository, times(1)).save(option1);
    }

    @Test
    void castVote_ThrowsDuplicateVoteException() {
        when(userRepository.findByUsername("voter1")).thenReturn(Optional.of(voter));
        when(pollRepository.findById(1L)).thenReturn(Optional.of(activePoll));
        when(voteRepository.existsByUserIdAndPollId(5L, 1L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> voteService.castVote(1L, 101L, "voter1"));
        verify(voteRepository, never()).save(any());
    }

    @Test
    void castVote_ThrowsWhenPollExpired() {
        Poll expiredPoll = Poll.builder()
                .id(2L)
                .question("Expired Question")
                .deadline(LocalDateTime.now().minusDays(1)) // Expired
                .isLocked(false)
                .isPublished(true)
                .build();

        when(userRepository.findByUsername("voter1")).thenReturn(Optional.of(voter));
        when(pollRepository.findById(2L)).thenReturn(Optional.of(expiredPoll));

        assertThrows(BadRequestException.class, () -> voteService.castVote(2L, 101L, "voter1"));
        verify(voteRepository, never()).save(any());
    }
}
