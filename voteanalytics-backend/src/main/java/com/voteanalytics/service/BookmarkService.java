package com.voteanalytics.service;

import com.voteanalytics.dto.bookmark.BookmarkDto;

import java.util.List;

public interface BookmarkService {
    List<BookmarkDto> getBookmarks(String username);
    BookmarkDto addBookmark(Long pollId, String username);
    void removeBookmark(Long pollId, String username);
    boolean isBookmarked(Long pollId, String username);
}
