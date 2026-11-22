package com.voteanalytics.dto.comment;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateCommentRequest {
    @NotBlank(message = "Comment text cannot be empty")
    @JsonAlias({"commentText", "comment"})
    private String text;
}
