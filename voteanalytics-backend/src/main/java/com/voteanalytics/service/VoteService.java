package com.voteanalytics.service;

import com.voteanalytics.dto.poll.PollDto;
import com.voteanalytics.dto.vote.VoteDetailDto;

import java.util.List;

public interface VoteService {
    PollDto castVote(Long pollId, Long optionId, String username);
    boolean hasVoted(Long pollId, String username);
    PollDto getPollResults(Long pollId, String currentUsername);
    List<VoteDetailDto> getVotingDetails(Long pollId, String adminUsername);
    List<PollDto> getMyVotes(String username);
}
