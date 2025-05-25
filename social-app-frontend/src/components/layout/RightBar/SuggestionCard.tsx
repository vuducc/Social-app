import {
  Box,
  Typography,
  Button,
  Grid,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToggleFollow } from "../../../hooks/useUser";
import { userService } from "../../../services/user.service";
import { Search as SearchIcon } from "@mui/icons-material";
import { useDebounce } from "../../../hooks/useDebounce";

const UserInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const UserItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(1),
  width: "100%",
}));

const SearchInput = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.04)",
    "& fieldset": { border: "none" },
  },
}));

interface SuggestionCardProps {
  open: boolean;
  onClose: () => void;
}

export const SuggestionCard = ({ open, onClose }: SuggestionCardProps) => {
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [followedUsers, setFollowedUsers] = useState<Record<string, boolean>>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const toggleFollowMutation = useToggleFollow();
  const navigate = useNavigate();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const results = await userService.getSuggestedUsers();
        setSuggestedUsers(results.users);
      } catch (error) {
        console.error("Error fetching suggested users:", error);
      }
    };

    if (open) {
      fetchSuggestedUsers();
    }
  }, [open]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      const filtered = suggestedUsers.filter((user) =>
        user.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(suggestedUsers);
    }
  }, [debouncedSearchTerm, suggestedUsers]);

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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          width: "400px",
          maxHeight: "500px",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6">Đề xuất người dùng</Typography>
      </DialogTitle>
      <DialogContent sx={{ padding: 0 }}>
        <Box
          sx={{
            padding: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            position: "sticky",
            top: 0,
            backgroundColor: "background.paper",
            zIndex: 1,
          }}
        >
          <SearchInput
            fullWidth
            placeholder="Tìm kiếm người dùng"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box
          sx={{
            padding: 2,
            maxHeight: "300px",
            overflowY: "auto",
            marginTop: 2,
          }}
        >
          <Grid container direction="column" spacing={1}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Grid item key={user.user_id} xs={12}>
                  <UserItem>
                    <UserInfo>
                      <Avatar
                        src={user.profile_picture_url || "/default-avatar.png"}
                        sx={{ width: 35, height: 35 }}
                        onClick={() => handleUserClick(user.user_id)}
                      />
                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          onClick={() => handleUserClick(user.user_id)}
                          style={{ cursor: "pointer" }}
                        >
                          {user.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.full_name}
                        </Typography>
                      </Box>
                    </UserInfo>
                    <Button
                      size="small"
                      variant={
                        followedUsers[user.user_id] || user.is_followed_by
                          ? "text"
                          : "contained"
                      }
                      onClick={() => handleFollow(user.user_id)}
                      disabled={
                        followedUsers[user.user_id] || user.is_followed_by
                      }
                      sx={{
                        minWidth: "80px",
                        ...(followedUsers[user.user_id] || user.is_followed_by
                          ? {
                              color: "text.secondary",
                              "&:hover": {
                                backgroundColor: "transparent",
                              },
                            }
                          : {}),
                      }}
                    >
                      {followedUsers[user.user_id] || user.is_followed_by
                        ? "Đang theo dõi"
                        : "Theo dõi"}
                    </Button>
                  </UserItem>
                </Grid>
              ))
            ) : (
              <Typography color="text.secondary" textAlign="center">
                Không có người dùng đề xuất
              </Typography>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};
