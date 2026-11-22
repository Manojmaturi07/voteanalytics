package com.voteanalytics.repository;

import com.voteanalytics.entity.TwoFactorBackupCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TwoFactorBackupCodeRepository extends JpaRepository<TwoFactorBackupCode, Long> {
    Optional<TwoFactorBackupCode> findByUserIdAndCodeAndUsedFalse(Long userId, String code);
    List<TwoFactorBackupCode> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
