-- Initial Seed Data for VoteAnalytics MySQL Database
-- Users: admin (admin123), john_doe (user123), jane_smith (user123)
-- BCrypt password hashes generated with salt rounds 10

INSERT INTO users (id, username, email, password, name, role, is_active, is_email_verified, two_factor_enabled, created_at, updated_at)
VALUES 
(1, 'admin', 'admin@example.com', '$2a$10$4LloGuBoNHAs/qjItnt3DuGUCNCIzrEd6CiGNWrNxiO.AaIVJoEqG', 'Administrator', 'ADMIN', TRUE, TRUE, FALSE, NOW(), NOW()),
(2, 'john_doe', 'john@example.com', '$2a$10$nRm7cWau1ob5.jhiOUq1LOdudsqRXWvSUR29iCMI9NKHWBuXcWzz6', 'John Doe', 'USER', TRUE, TRUE, FALSE, NOW(), NOW()),
(3, 'jane_smith', 'jane@example.com', '$2a$10$nRm7cWau1ob5.jhiOUq1LOdudsqRXWvSUR29iCMI9NKHWBuXcWzz6', 'Jane Smith', 'USER', TRUE, TRUE, FALSE, NOW(), NOW())
ON DUPLICATE KEY UPDATE username=VALUES(username);

INSERT INTO polls (id, question, deadline, is_locked, is_published, is_anonymous, category, tags, created_by_id, created_at, updated_at)
VALUES 
(1, 'What is your favorite programming language?', DATE_ADD(NOW(), INTERVAL 7 DAY), FALSE, TRUE, FALSE, 'Technology', 'programming, languages, development', 1, NOW(), NOW()),
(2, 'Which framework do you prefer for frontend development?', DATE_ADD(NOW(), INTERVAL 3 DAY), FALSE, TRUE, FALSE, 'Technology', 'frontend, frameworks, web', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE question=VALUES(question);

INSERT INTO poll_options (id, poll_id, option_text, vote_count)
VALUES 
(1, 1, 'JavaScript', 15),
(2, 1, 'Python', 12),
(3, 1, 'Java', 8),
(4, 1, 'C++', 5),
(5, 2, 'React', 20),
(6, 2, 'Vue', 10),
(7, 2, 'Angular', 6)
ON DUPLICATE KEY UPDATE option_text=VALUES(option_text);
