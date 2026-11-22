package com.voteanalytics.controller;

import com.voteanalytics.dto.bookmark.BookmarkDto;
import com.voteanalytics.dto.common.ApiResponse;
import com.voteanalytics.service.BookmarkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users/bookmarks")
@RequiredArgsConstructor
@Tag(name = "User Bookmarks", description = "Manage user bookmarked polls")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @GetMapping
    @Operation(summary = "Get all bookmarked polls for current user")
    public ResponseEntity<ApiResponse<List<BookmarkDto>>> getBookmarks(Authentication authentication) {
        List<BookmarkDto> bookmarks = bookmarkService.getBookmarks(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(bookmarks));
    }

    @PostMapping("/{pollId}")
    @Operation(summary = "Add poll to bookmarks")
    public ResponseEntity<ApiResponse<BookmarkDto>> addBookmark(@PathVariable Long pollId,
                                                                Authentication authentication) {
        BookmarkDto bookmark = bookmarkService.addBookmark(pollId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Poll bookmarked successfully", bookmark));
    }

    @DeleteMapping("/{pollId}")
    @Operation(summary = "Remove poll from bookmarks")
    public ResponseEntity<ApiResponse<Void>> removeBookmark(@PathVariable Long pollId,
                                                            Authentication authentication) {
        bookmarkService.removeBookmark(pollId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Bookmark removed successfully", null));
    }
}
