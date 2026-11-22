package com.voteanalytics.repository;

import com.voteanalytics.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Bookmark> findByUserIdAndPollId(Long userId, Long pollId);
    boolean existsByUserIdAndPollId(Long userId, Long pollId);
    void deleteByUserIdAndPollId(Long userId, Long pollId);
}
