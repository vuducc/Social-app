import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import { Comment } from "../../../types/comment.types";
import { CommentItem } from "./CommentItem";

const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

interface CommentListProps {
  comments: Comment[];
  onReply: (username: string, commentId: string) => void;
}

export const CommentList = ({ comments, onReply }: CommentListProps) => {
  return (
    <Container>
      {comments.map((comment) => (
        <CommentItem
          key={comment.comment_id}
          comment={comment}
          level="parent"
          onReply={onReply}
        />
      ))}
    </Container>
  );
};
