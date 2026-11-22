package com.voteanalytics.repository;

import com.voteanalytics.entity.User;
import com.voteanalytics.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    long countByRole(Role role);
    List<User> findAllByOrderByCreatedAtDesc();
}
