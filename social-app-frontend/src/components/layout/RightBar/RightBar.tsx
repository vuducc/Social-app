import { Box, Typography, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useAppSelector } from "../../../hooks/useRedux";
import { useNavigate } from "react-router-dom";
import { useSuggestedUsers, useToggleFollow } from "../../../hooks/useUser";
import { Avatar } from "../../common/Avatar/Avatar";
import { useState, useEffect } from "react";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { SuggestionCard } from "../RightBar/SuggestionCard";

const UserInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(3),
}));

// const SuggestedUsers = styled(Box)(({ theme }) => ({
//   "& .header": {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: theme.spacing(2),
//   },
// }));

// const UserItem = styled(Box)(({ theme }) => ({
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "space-between",
//   marginBottom: theme.spacing(2),
// }));

const AdminButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  color: theme.palette.primary.main,
  "&:hover": {
    backgroundColor: theme.palette.primary.main + "10",
  },
}));

export const RightBar = () => {
  const { user, roles } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const isAdmin = roles?.includes("admin");
  const { data: suggestedData } = useSuggestedUsers(5);
  const toggleFollowMutation = useToggleFollow();

  const [followedUsers, setFollowedUsers] = useState<Record<string, boolean>>(
    {}
  );
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [randomSuggestions, setRandomSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (suggestedData?.users) {
      const shuffled = suggestedData.users.sort(() => 0.5 - Math.random());
      setRandomSuggestions(shuffled.slice(0, 3));
    }
  }, [suggestedData]);

  const handleAdminClick = () => {
    navigate("/admin");
  };

  const handleFollow = async (userId: string) => {
    try {
      await toggleFollowMutation.mutateAsync(userId);
      setFollowedUsers((prev) => ({
        ...prev,
        [userId]: true,
      }));
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <Box>
      <UserInfo>
        <Avatar
          src={user?.profile_picture_url || ""}
          size="medium"
          onClick={() => handleUserClick(user?.user_id || "")}
          style={{ cursor: "pointer" }}
        />
        <Box sx={{ ml: 2 }}>
          <Typography
            variant="subtitle2"
            onClick={() => handleUserClick(user?.user_id || "")}
            style={{ cursor: "pointer" }}
          >
            {user?.username}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.full_name}
          </Typography>
        </Box>
      </UserInfo>

      <Box sx={{ mt: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            Gợi ý cho bạn
          </Typography>
          <Button
            variant="text"
            sx={{ color: "primary.main", fontWeight: 600 }}
            onClick={() => setSuggestionOpen(true)}
          >
            Xem tất cả
          </Button>
        </Box>

        {randomSuggestions.map((suggestedUser) => (
          <UserInfo key={suggestedUser.user_id}>
            <Avatar
              src={suggestedUser.profile_picture_url}
              size="small"
              onClick={() => handleUserClick(suggestedUser.user_id)}
              style={{ cursor: "pointer" }}
            />
            <Box sx={{ ml: 2, flex: 1 }}>
              <Typography
                variant="subtitle2"
                onClick={() => handleUserClick(suggestedUser.user_id)}
                style={{ cursor: "pointer" }}
              >
                {suggestedUser.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {suggestedUser.full_name}
              </Typography>
            </Box>
            <Button
              size="small"
              variant={
                followedUsers[suggestedUser.user_id] ||
                suggestedUser.is_followed_by
                  ? "text"
                  : "contained"
              }
              onClick={() => handleFollow(suggestedUser.user_id)}
              disabled={
                followedUsers[suggestedUser.user_id] ||
                suggestedUser.is_followed_by ||
                toggleFollowMutation.isPending
              }
              sx={{
                minWidth: "100px",
                ...(followedUsers[suggestedUser.user_id] ||
                suggestedUser.is_followed_by
                  ? {
                      color: "text.secondary",
                      "&:hover": {
                        backgroundColor: "transparent",
                      },
                    }
                  : {}),
              }}
            >
              {followedUsers[suggestedUser.user_id] ||
              suggestedUser.is_followed_by
                ? "Đang theo dõi"
                : "Theo dõi"}
            </Button>
          </UserInfo>
        ))}
      </Box>

      {isAdmin && (
        <Box sx={{ mt: 3 }}>
          <AdminButton
            startIcon={<AdminPanelSettingsIcon />}
            onClick={handleAdminClick}
          >
            Chuyển sang trang quản trị
          </AdminButton>
        </Box>
      )}

      {/* Hộp thoại SuggestionCard */}
      <SuggestionCard
        open={suggestionOpen}
        onClose={() => setSuggestionOpen(false)}
      />
    </Box>
  );
};
