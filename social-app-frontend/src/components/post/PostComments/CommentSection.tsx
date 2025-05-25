import { styled } from "@mui/material/styles";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { MoreHoriz as MoreHorizIcon } from "@mui/icons-material";
import { Post } from "../../../types/post.types";
import { useComments } from "../../../hooks/useComment";
import { useState } from "react";
import { CommentList } from "./CommentList";
import { CommentInput } from "./CommentInput";
import { PostActions } from "../PostActions/PostActions";

const Container = styled(Box)(({ theme }) => ({
  flex: "0 0 35%",
  display: "flex",
  flexDirection: "column",
  borderLeft: `1px solid ${theme.palette.divider}`,
}));

const Header = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const ScrollableContent = styled(Box)({
  flex: 1,
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    width: 6,
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f1f1",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#888",
    borderRadius: 3,
  },
});

interface CommentSectionProps {
  post: Post;
}

export const CommentSection = ({ post }: CommentSectionProps) => {
  const [commentContent, setCommentContent] = useState("");
  const [replyTo, setReplyTo] = useState<{
    username: string;
    commentId: string;
  } | null>(null);

  const { data, isLoading, hasNextPage, fetchNextPage } = useComments(
    post.post_id
  );

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage) {
      fetchNextPage();
    }
  };

  return (
    <Container>
      <Header>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            src={post.user_profile_picture_url || ""}
            alt={post.user_username || ""}
            sx={{ width: 32, height: 32, mr: 1.5 }}
          />
          <Typography variant="subtitle2" fontWeight={600}>
            {post.user_username}
          </Typography>
        </Box>
        <IconButton size="small">
          <MoreHorizIcon />
        </IconButton>
      </Header>

      <ScrollableContent onScroll={handleScroll}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <CommentList
            comments={data?.pages.flatMap((page) => page.comments) || []}
            onReply={(username, commentId) => {
              setReplyTo({ username, commentId });
              setCommentContent(`@${username} `);
            }}
          />
        )}
      </ScrollableContent>

      <PostActions post={post} />

      <CommentInput
        value={commentContent}
        onChange={setCommentContent}
        postId={post.post_id}
        replyTo={replyTo}
        onCancelReply={() => {
          setReplyTo(null);
          setCommentContent("");
        }}
      />
    </Container>
  );
};
