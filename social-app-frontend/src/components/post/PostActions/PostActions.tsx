import { styled } from "@mui/material/styles";
import { Box, IconButton, Typography } from "@mui/material";
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  ChatBubbleOutline as CommentIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { Post } from "../../../types/post.types";
import { formatTimeAgo } from "../../../utils/dateUtils";
import { updatePostLike } from "../../../store/slices/postSlice";
import { useAppDispatch } from "../../../hooks/useRedux";
import { useToggleLike } from "../../../hooks/usePost";
import { useState } from "react";
import { ReportDialog } from "../../common/ReportDialog";

const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const ActionsWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  marginBottom: 8,
});

const ActionButtons = styled(Box)({
  display: "flex",
  alignItems: "center",
});

const LikeCount = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(1),
}));

const TimeStamp = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

interface PostActionsProps {
  post: Post;
  onCommentClick?: () => void;
}

export const PostActions = ({ post, onCommentClick }: PostActionsProps) => {
  const dispatch = useAppDispatch();
  const { mutate: likePost } = useToggleLike();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const handleLike = () => {
    likePost(post.post_id, {
      onSuccess: (data) => {
        dispatch(
          updatePostLike({
            postId: post.post_id,
            isLiked: data.is_liked,
            likesCount: data.likes_count,
          })
        );
      },
    });
  };

  return (
    <Container>
      <ActionsWrapper>
        <ActionButtons>
          <IconButton size="small" onClick={handleLike}>
            {post.is_liked_by_me ? (
              <FavoriteIcon sx={{ color: "red" }} />
            ) : (
              <FavoriteBorderIcon />
            )}
          </IconButton>
          <IconButton size="small" onClick={onCommentClick}>
            <CommentIcon />
          </IconButton>
          <IconButton size="small">
            <ShareIcon />
          </IconButton>
        </ActionButtons>
        <Box sx={{ ml: "auto" }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setReportDialogOpen(true);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
      </ActionsWrapper>

      <LikeCount variant="subtitle2">{post.likes_count} lượt thích</LikeCount>

      <TimeStamp variant="caption">{formatTimeAgo(post.created_at)}</TimeStamp>

      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        targetId={post.post_id}
        targetType="POST"
      />
    </Container>
  );
};
