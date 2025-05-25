import { CardContent, Typography, styled } from "@mui/material";
import { useState } from "react";
import { CommentDialog } from "../PostComments/CommentDialog";
import { usePost } from "../../../hooks/usePost";

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  "&:last-child": {
    paddingBottom: theme.spacing(2),
  },
}));

interface PostContentProps {
  username: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  postId: string;
}

export const PostContent = ({
  username,
  content,
  likesCount,
  commentsCount,
  postId,
}: PostContentProps) => {
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const { data: post, isLoading } = usePost(isCommentOpen ? postId : "");

  return (
    <>
      <StyledCardContent>
        <Typography variant="subtitle2" gutterBottom>
          {likesCount.toLocaleString()} lượt thích
        </Typography>
        <Typography variant="body2" color="text.primary">
          <Typography
            component="span"
            variant="subtitle2"
            sx={{ fontWeight: 600, mr: 1 }}
          >
            {username}
          </Typography>
          {content}
        </Typography>
        {commentsCount > 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, cursor: "pointer" }}
            onClick={() => setIsCommentOpen(true)}
          >
            Xem tất cả {commentsCount} bình luận
          </Typography>
        )}
      </StyledCardContent>

      {isCommentOpen && post && !isLoading && (
        <CommentDialog
          open={true}
          onClose={() => setIsCommentOpen(false)}
          post={post}
        />
      )}
    </>
  );
};
