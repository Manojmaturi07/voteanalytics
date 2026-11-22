package com.voteanalytics.repository;

import com.voteanalytics.entity.EmailVerificationToken;
import com.voteanalytics.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    Optional<EmailVerificationToken> findByToken(String token);
    int deleteByUser(User user);
}
