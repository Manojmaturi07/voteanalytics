package com.voteanalytics.service;

import com.voteanalytics.dto.poll.CreatePollRequest;
import com.voteanalytics.dto.poll.PollDto;
import com.voteanalytics.dto.poll.UpdatePollRequest;
import com.voteanalytics.entity.Poll;
import com.voteanalytics.entity.PollOption;
import com.voteanalytics.entity.User;
import com.voteanalytics.enums.Role;
import com.voteanalytics.exception.ForbiddenException;
import com.voteanalytics.mapper.PollMapper;
import com.voteanalytics.repository.PollOptionRepository;
import com.voteanalytics.repository.PollRepository;
import com.voteanalytics.repository.UserRepository;
import com.voteanalytics.repository.VoteRepository;
import com.voteanalytics.service.impl.PollServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PollServiceTest {

    @Mock
    private PollRepository pollRepository;

    @Mock
    private PollOptionRepository pollOptionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VoteRepository voteRepository;

    @Mock
    private PollMapper pollMapper;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private PollServiceImpl pollService;

    private User admin1;
    private User admin2;
    private Poll pollByAdmin1;

    @BeforeEach
    void setUp() {
        admin1 = User.builder().id(1L).username("admin1").role(Role.ADMIN).name("Admin 1").email("a1@test.com").build();
        admin2 = User.builder().id(2L).username("admin2").role(Role.ADMIN).name("Admin 2").email("a2@test.com").build();

        pollByAdmin1 = Poll.builder()
                .id(10L)
                .question("Admin 1 Poll?")
                .deadline(LocalDateTime.now().plusDays(5))
                .isLocked(false)
                .isPublished(true)
                .createdBy(admin1)
                .options(new ArrayList<>())
                .build();
    }

    @Test
    void createPoll_AttachesAdminAndOptions() {
        CreatePollRequest request = CreatePollRequest.builder()
                .question("New Poll?")
                .options(List.of("Option A", "Option B"))
                .deadline(LocalDateTime.now().plusDays(3))
                .category("Tech")
                .build();

        when(userRepository.findByUsername("admin1")).thenReturn(Optional.of(admin1));
        when(pollRepository.save(any(Poll.class))).thenAnswer(i -> {
            Poll p = i.getArgument(0);
            p.setId(99L);
            return p;
        });
        when(pollMapper.toDto(any(), eq(false))).thenReturn(PollDto.builder().id(99L).question("New Poll?").build());

        PollDto result = pollService.createPoll(request, "admin1");

        assertNotNull(result);
        assertEquals(99L, result.getId());
        verify(pollRepository, times(1)).save(any(Poll.class));
    }

    @Test
    void updatePoll_RejectsWhenAdminDoesNotOwnPoll() {
        UpdatePollRequest request = UpdatePollRequest.builder()
                .question("Hacked Title")
                .build();

        when(pollRepository.findById(10L)).thenReturn(Optional.of(pollByAdmin1));

        // Admin 2 tries to update Admin 1's poll -> ForbiddenException!
        assertThrows(ForbiddenException.class, () -> pollService.updatePoll(10L, request, "admin2"));
        verify(pollRepository, never()).save(any());
    }

    @Test
    void deletePoll_RejectsWhenAdminDoesNotOwnPoll() {
        when(pollRepository.findById(10L)).thenReturn(Optional.of(pollByAdmin1));

        // Admin 2 tries to delete Admin 1's poll -> ForbiddenException!
        assertThrows(ForbiddenException.class, () -> pollService.deletePoll(10L, "admin2"));
        verify(pollRepository, never()).delete(any());
    }

    @Test
    void deletePoll_SuccessWhenAdminOwnsPoll() {
        when(pollRepository.findById(10L)).thenReturn(Optional.of(pollByAdmin1));

        pollService.deletePoll(10L, "admin1");
        verify(pollRepository, times(1)).delete(pollByAdmin1);
    }
}
