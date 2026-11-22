package com.voteanalytics.config;

import com.voteanalytics.entity.Poll;
import com.voteanalytics.entity.PollOption;
import com.voteanalytics.entity.User;
import com.voteanalytics.enums.Role;
import com.voteanalytics.repository.PollRepository;
import com.voteanalytics.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PollRepository pollRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Bootstrapping default users and initial sample polls...");

            // 1. Default Admin
            User admin = User.builder()
                    .username("admin")
                    .email("admin@example.com")
                    .password(passwordEncoder.encode("admin123"))
                    .name("Administrator")
                    .role(Role.ADMIN)
                    .isActive(true)
                    .isEmailVerified(true)
                    .twoFactorEnabled(false)
                    .build();
            admin = userRepository.save(admin);

            // 2. Default Standard Users
            User john = User.builder()
                    .username("john_doe")
                    .email("john@example.com")
                    .password(passwordEncoder.encode("user123"))
                    .name("John Doe")
                    .role(Role.USER)
                    .isActive(true)
                    .isEmailVerified(true)
                    .twoFactorEnabled(false)
                    .build();
            userRepository.save(john);

            User jane = User.builder()
                    .username("jane_smith")
                    .email("jane@example.com")
                    .password(passwordEncoder.encode("user123"))
                    .name("Jane Smith")
                    .role(Role.USER)
                    .isActive(true)
                    .isEmailVerified(true)
                    .twoFactorEnabled(false)
                    .build();
            userRepository.save(jane);

            // 3. Default Initial Poll 1
            Poll poll1 = Poll.builder()
                    .question("What is your favorite programming language?")
                    .deadline(LocalDateTime.now().plusDays(7))
                    .isLocked(false)
                    .isPublished(true)
                    .isAnonymous(false)
                    .category("Technology")
                    .tags("programming, languages, development")
                    .createdBy(admin)
                    .options(new ArrayList<>())
                    .build();

            poll1.addOption(PollOption.builder().optionText("JavaScript").voteCount(15).build());
            poll1.addOption(PollOption.builder().optionText("Python").voteCount(12).build());
            poll1.addOption(PollOption.builder().optionText("Java").voteCount(8).build());
            poll1.addOption(PollOption.builder().optionText("C++").voteCount(5).build());
            pollRepository.save(poll1);

            // 4. Default Initial Poll 2
            Poll poll2 = Poll.builder()
                    .question("Which framework do you prefer for frontend development?")
                    .deadline(LocalDateTime.now().plusDays(3))
                    .isLocked(false)
                    .isPublished(true)
                    .isAnonymous(false)
                    .category("Technology")
                    .tags("frontend, frameworks, web")
                    .createdBy(admin)
                    .options(new ArrayList<>())
                    .build();

            poll2.addOption(PollOption.builder().optionText("React").voteCount(20).build());
            poll2.addOption(PollOption.builder().optionText("Vue").voteCount(10).build());
            poll2.addOption(PollOption.builder().optionText("Angular").voteCount(6).build());
            pollRepository.save(poll2);

            log.info("Default seed data initialized successfully.");
        }
    }
}
