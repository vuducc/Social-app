import {
  CardHeader,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  styled,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { useState } from "react";
import { formatTimeAgo } from "../../../utils/dateUtils";
import { useAppSelector } from "../../../hooks/useRedux";
import { useDeletePost } from "../../../hooks/usePost";
import { useNavigate } from "react-router-dom";
import { ReportDialog } from "../../common/ReportDialog";

const StyledCardHeader = styled(CardHeader)({
  padding: "12px 16px",
});

interface PostHeaderProps {
  username: string;
  profilePicture: string | null;
  createdAt: string;
  userId: string;
  postId: string;
}

export const PostHeader = ({
  username,
  profilePicture,
  createdAt,
  userId,
  postId,
}: PostHeaderProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const currentUser = useAppSelector((state) => state.auth.user);
  const { mutate: deletePost } = useDeletePost();
  const navigate = useNavigate();

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleDeletePost = () => {
    deletePost(postId);
    handleCloseMenu();
  };

  const isOwnPost = currentUser?.user_id === userId;

  const handleNavigateToProfile = () => {
    navigate(`/profile/${userId}`);
  };

  return (
    <StyledCardHeader
      avatar={
        <Avatar
          src={profilePicture || undefined}
          alt={username}
          sx={{ width: 32, height: 32, cursor: "pointer" }}
          onClick={handleNavigateToProfile}
        />
      }
      action={
        <>
          <IconButton onClick={handleOpenMenu}>
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {isOwnPost ? (
              <MenuItem onClick={handleDeletePost}>
                <Typography color="error">Xóa bài viết</Typography>
              </MenuItem>
            ) : (
              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  setReportDialogOpen(true);
                }}
              >
                <Typography color="error">Báo cáo bài viết</Typography>
              </MenuItem>
            )}
          </Menu>

          <ReportDialog
            open={reportDialogOpen}
            onClose={() => setReportDialogOpen(false)}
            targetId={postId}
            targetType="POST"
          />
        </>
      }
      title={
        <Typography
          variant="body1"
          sx={{ cursor: "pointer" }}
          onClick={handleNavigateToProfile}
        >
          {username}
        </Typography>
      }
      subheader={formatTimeAgo(createdAt)}
    />
  );
};
