package com.voteanalytics.service.impl;

import com.voteanalytics.dto.analytics.AdminOverviewDto;
import com.voteanalytics.dto.analytics.CategoryDistributionDto;
import com.voteanalytics.dto.poll.PollDto;
import com.voteanalytics.entity.Poll;
import com.voteanalytics.entity.User;
import com.voteanalytics.exception.ResourceNotFoundException;
import com.voteanalytics.mapper.PollMapper;
import com.voteanalytics.repository.PollRepository;
import com.voteanalytics.repository.UserRepository;
import com.voteanalytics.repository.VoteRepository;
import com.voteanalytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final PollRepository pollRepository;
    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final PollMapper pollMapper;

    @Override
    @Transactional(readOnly = true)
    public AdminOverviewDto getOverview(String adminUsername) {
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found: " + adminUsername));

        LocalDateTime now = LocalDateTime.now();
        long totalPolls = pollRepository.countByCreatedBy(admin);
        long totalVotes = voteRepository.countTotalVotesByAdmin(admin);
        long activePolls = pollRepository.countActivePollsByAdmin(admin, now);
        long completedPolls = pollRepository.countCompletedPollsByAdmin(admin, now);
        long totalUsers = userRepository.count();

        return AdminOverviewDto.builder()
                .totalPolls(totalPolls)
                .totalVotes(totalVotes)
                .activePolls(activePolls)
                .completedPolls(completedPolls)
                .totalUsers(totalUsers)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PollDto> getPopularPolls(String adminUsername) {
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found: " + adminUsername));

        List<Poll> popularPolls = voteRepository.findPopularPollsByAdmin(admin);

        return popularPolls.stream()
                .limit(5)
                .map(p -> pollMapper.toDto(p, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDistributionDto getCategoryDistribution(String adminUsername) {
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found: " + adminUsername));

        List<Object[]> results = pollRepository.countCategoryDistributionByAdmin(admin);

        List<String> labels = new ArrayList<>();
        List<Long> values = new ArrayList<>();

        for (Object[] row : results) {
            String category = row[0] != null ? (String) row[0] : "Uncategorized";
            Long count = (Long) row[1];
            labels.add(category);
            values.add(count);
        }

        return CategoryDistributionDto.builder()
                .labels(labels)
                .values(values)
                .build();
    }
}
