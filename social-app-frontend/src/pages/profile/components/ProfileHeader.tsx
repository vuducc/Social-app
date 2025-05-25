import { Box, Button, Typography, styled, Menu, MenuItem } from "@mui/material";
import { Settings, Edit } from "@mui/icons-material";
import { Avatar } from "../../../components/common/Avatar/Avatar";
import { User } from "../../../types/user.types";
import { useUpdateProfile, useUpdateAvatar } from "../../../hooks/useUser";
import { useState } from "react";
import { useToggleFollow } from "../../../hooks/useUser";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner/LoadingSpinner";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../hooks/useRedux";
import { FollowersModal } from "../../../components/profile/FollowersModal";
import { useQueryClient } from "@tanstack/react-query";

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "300px 1fr",
  gap: theme.spacing(8),
  padding: theme.spacing(4, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "1fr",
    gap: theme.spacing(4),
    padding: theme.spacing(2),
  },
}));

const AvatarContainer = styled(Box)(() => ({
  display: "flex",
  justifyContent: "center",
}));

const InfoContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(6),
  "& .stat-item": {
    "& .value": {
      fontWeight: 600,
      marginRight: theme.spacing(1),
    },
  },
}));

interface ProfileHeaderProps {
  profile: User;
  postsCount: number;
}

export const ProfileHeader = ({ profile, postsCount }: ProfileHeaderProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { isPending: isUpdating } = useUpdateProfile();
  const { mutate: updateAvatar, isPending: isUpdatingAvatar } =
    useUpdateAvatar();
  const { mutate: toggleFollow, isPending: isToggling } = useToggleFollow();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const isCurrentUser = currentUser?.user_id === profile.user_id;
  const queryClient = useQueryClient();

  const [localIsFollowing, setLocalIsFollowing] = useState(
    profile.is_following
  );
  const [localFollowersCount, setLocalFollowersCount] = useState(
    profile.followers_count
  );
  const [followModal, setFollowModal] = useState<
    "followers" | "following" | null
  >(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast.success("Đăng xuất thành công");
    } catch (error) {
      toast.error("Không thể đăng xuất");
    }
  };

  const handleAvatarChange = async (file: File) => {
    try {
      await updateAvatar(file);
    } catch (error) {
      toast.error("Không thể cập nhật ảnh đại diện");
    }
  };

  const handleToggleFollow = async () => {
    try {
      setLocalIsFollowing(!localIsFollowing);
      setLocalFollowersCount((prev) =>
        localIsFollowing ? prev - 1 : prev + 1
      );
      await toggleFollow(profile.user_id);
    } catch (error) {
      setLocalIsFollowing(profile.is_following);
      setLocalFollowersCount(profile.followers_count);
      toast.error("Không thể thực hiện thao tác này");
    }
  };

  const isLoading = isUpdating || isUpdatingAvatar;

  const handleEditProfile = () => {
    navigate("/accounts/edit");
  };

  const handleFollowChange = () => {
    queryClient.invalidateQueries({
      queryKey: ["userProfile", profile.user_id],
    });
  };

  return (
    <HeaderContainer>
      <AvatarContainer>
        <Avatar
          src={profile.profile_picture_url}
          alt={profile.username}
          size="large"
          editable={isCurrentUser}
          onFileSelect={handleAvatarChange}
          disabled={isLoading}
        />
      </AvatarContainer>

      <InfoContainer>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h5">{profile.username}</Typography>
          {isCurrentUser ? (
            <>
              <Button
                variant="outlined"
                size="small"
                onClick={handleEditProfile}
                startIcon={<Edit />}
              >
                Chỉnh sửa trang cá nhân
              </Button>
              <Button
                variant="text"
                sx={{ minWidth: 0, p: 1 }}
                onClick={handleMenuOpen}
                disabled={isLoading}
              >
                <Settings />
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="contained"
              color={localIsFollowing ? "inherit" : "primary"}
              onClick={handleToggleFollow}
              disabled={isToggling}
            >
              {isToggling ? (
                <LoadingSpinner size={20} />
              ) : localIsFollowing ? (
                "Đang theo dõi"
              ) : (
                "Theo dõi"
              )}
            </Button>
          )}
        </Box>

        <StatsContainer>
          <Box className="stat-item">
            <span className="value">{postsCount}</span>
            <span>bài viết</span>
          </Box>
          <Box
            className="stat-item"
            sx={{ cursor: "pointer" }}
            onClick={() => setFollowModal("followers")}
          >
            <span className="value">{localFollowersCount}</span>
            <span>người theo dõi</span>
          </Box>
          <Box
            className="stat-item"
            sx={{ cursor: "pointer" }}
            onClick={() => setFollowModal("following")}
          >
            <span className="value">{profile.following_count}</span>
            <span>đang theo dõi</span>
          </Box>
        </StatsContainer>

        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {profile.full_name}
          </Typography>
          {profile.bio && (
            <Typography variant="body2" whiteSpace="pre-line">
              {profile.bio}
            </Typography>
          )}
        </Box>
      </InfoContainer>

      <FollowersModal
        open={followModal !== null}
        onClose={() => setFollowModal(null)}
        userId={profile.user_id}
        type={followModal || "followers"}
        onFollowChange={handleFollowChange}
      />
    </HeaderContainer>
  );
};
