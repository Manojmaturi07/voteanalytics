package com.voteanalytics.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "polls", indexes = {
    @Index(name = "idx_poll_created_by", columnList = "created_by_id"),
    @Index(name = "idx_poll_deadline", columnList = "deadline"),
    @Index(name = "idx_poll_published", columnList = "is_published")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Poll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String question;

    @Column(nullable = false)
    private LocalDateTime deadline;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isLocked = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isPublished = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isAnonymous = false;

    @Column(length = 100)
    private String category;

    @Column(length = 500)
    private String tags; // Comma separated tags e.g. "tech, frontend"

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "poll", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    @OrderBy("id ASC")
    private List<PollOption> options = new ArrayList<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public void addOption(PollOption option) {
        options.add(option);
        option.setPoll(this);
    }

    public void removeOption(PollOption option) {
        options.remove(option);
        option.setPoll(null);
    }

    public boolean isExpired() {
        return deadline != null && deadline.isBefore(LocalDateTime.now());
    }

    public boolean canVote() {
        return Boolean.TRUE.equals(isPublished) && !Boolean.TRUE.equals(isLocked) && !isExpired();
    }
}
