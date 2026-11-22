package com.voteanalytics.mapper;

import com.voteanalytics.dto.bookmark.BookmarkDto;
import com.voteanalytics.entity.Bookmark;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookmarkMapper {

    private final PollMapper pollMapper;

    public BookmarkDto toDto(Bookmark bookmark) {
        if (bookmark == null) return null;

        return BookmarkDto.builder()
                .id(bookmark.getId())
                .pollId(bookmark.getPoll() != null ? bookmark.getPoll().getId() : null)
                .poll(bookmark.getPoll() != null ? pollMapper.toDto(bookmark.getPoll(), false) : null)
                .createdAt(bookmark.getCreatedAt())
                .build();
    }
}
