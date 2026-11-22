package com.voteanalytics.repository;

import com.voteanalytics.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPollIdOrderByCreatedAtDesc(Long pollId);
    long countByPollId(Long pollId);
}
