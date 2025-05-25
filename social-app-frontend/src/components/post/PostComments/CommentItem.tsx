import { styled } from "@mui/material/styles";
import {
  Box,
  Avatar,
  Typography,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Comment } from "../../../types/comment.types";
import { useReplies } from "../../../hooks/useComment";
import { useState } from "react";
import { formatTimeAgo } from "../../../utils/dateUtils";
import { ReportDialog } from "../../common/ReportDialog";
import { MoreVert } from "@mui/icons-material";

const CommentContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isReply",
})<{ isReply?: boolean }>(({ theme, isReply }) => ({
  paddingLeft: isReply ? theme.spacing(4) : 0,
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}));

const ContentWrapper = styled(Box)({
  display: "flex",
});

const UserInfo = styled(Box)({
  flex: 1,
});

const ActionText = styled(Typography)(({ theme }) => ({
  cursor: "pointer",
  fontWeight: 600,
  color: theme.palette.text.secondary,
  "&:hover": {
    color: theme.palette.text.primary,
  },
}));

const RepliesButton = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginTop: theme.spacing(1),
  color: theme.palette.text.secondary,
  cursor: "pointer",
  "&:hover": {
    color: theme.palette.text.primary,
  },
}));

interface CommentItemProps {
  comment: Comment;
  level?: "parent" | "reply";
  onReply: (username: string, commentId: string) => void;
}

export const CommentItem = ({
  comment,
  level = "parent",
  onReply,
}: CommentItemProps) => {
  const [showReplies, setShowReplies] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const {
    data: repliesData,
    isLoading: isLoadingReplies,
    hasNextPage,
    fetchNextPage,
  } = useReplies(comment.comment_id);

  const handleLoadMoreReplies = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const handleReply = () => {
    const parentId =
      level === "reply" ? comment.parent_id! : comment.comment_id;
    onReply(comment.user.username, parentId);
  };

  return (
    <CommentContainer isReply={level === "reply"}>
      <ContentWrapper>
        <Avatar
          src={comment.user.profile_picture_url || undefined}
          alt={comment.user.username}
          sx={{ width: 32, height: 32, mr: 1.5 }}
        />
        <UserInfo>
          <Box sx={{ display: "flex", alignItems: "baseline" }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mr: 1 }}>
              {comment.user.username}
            </Typography>
            <Typography variant="body2">{comment.content}</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mt: 0.5, gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {formatTimeAgo(comment.created_at)}
            </Typography>
            <ActionText variant="caption" onClick={handleReply}>
              Trả lời
            </ActionText>
          </Box>

          {level === "parent" && comment.replies_count > 0 && (
            <RepliesButton
              variant="caption"
              onClick={() => setShowReplies(!showReplies)}
            >
              {showReplies ? "Ẩn" : "Xem"} {comment.replies_count} phản hồi
            </RepliesButton>
          )}
        </UserInfo>
        <Box sx={{ ml: "auto" }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setReportDialogOpen(true);
            }}
          >
            <MoreVert />
          </IconButton>
        </Box>
      </ContentWrapper>

      {level === "parent" && showReplies && (
        <Box sx={{ mt: 1 }}>
          {isLoadingReplies ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : (
            <>
              {repliesData?.pages.map((page) =>
                page.comments.map((reply) => (
                  <CommentItem
                    key={reply.comment_id}
                    comment={reply}
                    level="reply"
                    onReply={onReply}
                  />
                ))
              )}
              {hasNextPage && (
                <ActionText
                  variant="caption"
                  sx={{ ml: 6, mt: 1, display: "block" }}
                  onClick={handleLoadMoreReplies}
                >
                  Xem thêm phản hồi...
                </ActionText>
              )}
            </>
          )}
        </Box>
      )}

      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        targetId={comment.comment_id}
        targetType="COMMENT"
      />
    </CommentContainer>
  );
};
