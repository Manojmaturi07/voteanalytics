package com.voteanalytics.repository;

import com.voteanalytics.entity.Poll;
import com.voteanalytics.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PollRepository extends JpaRepository<Poll, Long> {

    List<Poll> findAllByOrderByCreatedAtDesc();

    // Voter view: only published, non-expired, non-locked
    List<Poll> findByIsPublishedTrueAndIsLockedFalseAndDeadlineAfterOrderByCreatedAtDesc(LocalDateTime now);

    // Admin dashboard: isolated to polls created by the specific admin
    List<Poll> findAllByCreatedByOrderByCreatedAtDesc(User user);

    long countByCreatedBy(User user);

    @Query("SELECT COUNT(p) FROM Poll p WHERE p.createdBy = :user AND p.isLocked = false AND p.deadline > :now")
    long countActivePollsByAdmin(@Param("user") User user, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(p) FROM Poll p WHERE p.createdBy = :user AND (p.isLocked = true OR p.deadline <= :now)")
    long countCompletedPollsByAdmin(@Param("user") User user, @Param("now") LocalDateTime now);

    @Query("SELECT p.category, COUNT(p) FROM Poll p WHERE p.createdBy = :user GROUP BY p.category")
    List<Object[]> countCategoryDistributionByAdmin(@Param("user") User user);
}
