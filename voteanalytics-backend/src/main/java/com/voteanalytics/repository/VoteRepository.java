package com.voteanalytics.repository;

import com.voteanalytics.entity.Poll;
import com.voteanalytics.entity.User;
import com.voteanalytics.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    boolean existsByUserIdAndPollId(Long userId, Long pollId);

    Optional<Vote> findByUserIdAndPollId(Long userId, Long pollId);

    List<Vote> findByPollIdOrderByVotedAtDesc(Long pollId);

    List<Vote> findByUserIdOrderByVotedAtDesc(Long userId);

    long countByPollId(Long pollId);

    @Query("SELECT COUNT(v) FROM Vote v WHERE v.poll.createdBy = :user")
    long countTotalVotesByAdmin(@Param("user") User user);

    @Query("SELECT v.poll FROM Vote v WHERE v.poll.createdBy = :user GROUP BY v.poll ORDER BY COUNT(v) DESC")
    List<Poll> findPopularPollsByAdmin(@Param("user") User user);
}
