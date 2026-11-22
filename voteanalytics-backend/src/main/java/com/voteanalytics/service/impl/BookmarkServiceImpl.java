package com.voteanalytics.service.impl;

import com.voteanalytics.dto.bookmark.BookmarkDto;
import com.voteanalytics.entity.Bookmark;
import com.voteanalytics.entity.Poll;
import com.voteanalytics.entity.User;
import com.voteanalytics.exception.DuplicateResourceException;
import com.voteanalytics.exception.ResourceNotFoundException;
import com.voteanalytics.mapper.BookmarkMapper;
import com.voteanalytics.repository.BookmarkRepository;
import com.voteanalytics.repository.PollRepository;
import com.voteanalytics.repository.UserRepository;
import com.voteanalytics.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookmarkServiceImpl implements BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final PollRepository pollRepository;
    private final BookmarkMapper bookmarkMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BookmarkDto> getBookmarks(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        List<Bookmark> bookmarks = bookmarkRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return bookmarks.stream().map(bookmarkMapper::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookmarkDto addBookmark(Long pollId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with id: " + pollId));

        if (bookmarkRepository.existsByUserIdAndPollId(user.getId(), poll.getId())) {
            throw new DuplicateResourceException("This poll is already bookmarked");
        }

        Bookmark bookmark = Bookmark.builder()
                .user(user)
                .poll(poll)
                .build();

        bookmark = bookmarkRepository.save(bookmark);
        return bookmarkMapper.toDto(bookmark);
    }

    @Override
    @Transactional
    public void removeBookmark(Long pollId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        bookmarkRepository.deleteByUserIdAndPollId(user.getId(), pollId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isBookmarked(Long pollId, String username) {
        if (username == null) return false;
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return false;
        return bookmarkRepository.existsByUserIdAndPollId(user.getId(), pollId);
    }
}
