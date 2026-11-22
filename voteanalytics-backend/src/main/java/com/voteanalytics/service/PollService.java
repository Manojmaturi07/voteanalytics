package com.voteanalytics.service;

import com.voteanalytics.dto.poll.CreatePollRequest;
import com.voteanalytics.dto.poll.PollDto;
import com.voteanalytics.dto.poll.UpdatePollRequest;

import java.util.List;

public interface PollService {
    List<PollDto> getAllPublishedPolls(String currentUsername);
    List<PollDto> getAdminPolls(String adminUsername);
    PollDto getPollById(Long pollId, String currentUsername);
    PollDto createPoll(CreatePollRequest request, String adminUsername);
    PollDto updatePoll(Long pollId, UpdatePollRequest request, String adminUsername);
    void deletePoll(Long pollId, String adminUsername);
    PollDto setPublishStatus(Long pollId, boolean publish, String adminUsername);
}
