import {
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  styled,
  InputAdornment,
  CircularProgress,
  Avatar,
} from "@mui/material";
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import { userService } from "../../../services/user.service";
import { useNavigate } from "react-router-dom";

const SearchContainer = styled(Box)(({ theme }) => ({
  width: 400,
  height: "100vh",
  backgroundColor: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
  display: "flex",
  flexDirection: "column",
  position: "fixed",
  left: 73,
  top: 0,
  zIndex: 1200,
  transform: "translateX(-100%)",
  transition: "transform 0.3s ease-in-out, visibility 0.3s ease-in-out",
  boxShadow: theme.shadows[3],
  visibility: "hidden",
  [theme.breakpoints.down("md")]: {
    left: 0,
    width: "100%",
    maxWidth: 400,
  },
}));

const SearchHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const SearchInput = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.04)",
    "& fieldset": {
      border: "none",
    },
    "&:hover fieldset": {
      border: "none",
    },
    "&.Mui-focused fieldset": {
      border: "none",
    },
  },
}));

const SearchResults = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing(2),
}));

const UserListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1),
  borderRadius: 8,
  cursor: "pointer",
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.04)",
  },
  marginBottom: theme.spacing(1),
}));

const UserInfo = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
  flex: 1,
});

interface SearchSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchSidebar = ({ isOpen, onClose }: SearchSidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const navigate = useNavigate();

  useEffect(() => {
    const searchUsers = async () => {
      if (debouncedSearch) {
        setIsSearching(true);
        try {
          const results = await userService.searchUsers(debouncedSearch);
          setSearchResults(results.users);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    searchUsers();
  }, [debouncedSearch]);

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  return (
    <SearchContainer
      sx={{
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        visibility: isOpen ? "visible" : "hidden",
        pointerEvents: isOpen ? "auto" : "none",
      }}
    >
      <SearchHeader>
        <Typography variant="h6" fontWeight={600} mb={3}>
          Tìm kiếm
        </Typography>
        <SearchInput
          fullWidth
          placeholder="Tìm kiếm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                {isSearching ? (
                  <CircularProgress size={20} />
                ) : (
                  <CloseIcon
                    sx={{ cursor: "pointer" }}
                    onClick={() => setSearchTerm("")}
                  />
                )}
              </InputAdornment>
            ),
          }}
        />
      </SearchHeader>

      <SearchResults>
        {!searchTerm && (
          <Box sx={{ textAlign: "center", color: "text.secondary", mt: 4 }}>
            <Typography>Tìm kiếm người dùng</Typography>
          </Box>
        )}

        {searchResults.length > 0 && (
          <List>
            {searchResults.map((user) => (
              <UserListItem
                key={user.user_id}
                onClick={() => handleUserClick(user.user_id)}
              >
                <UserInfo>
                  <Avatar
                    src={user.profile_picture_url || "/default-avatar.png"}
                    sx={{ width: 44, height: 44 }}
                  />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {user.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.full_name}
                    </Typography>
                  </Box>
                </UserInfo>
              </UserListItem>
            ))}
          </List>
        )}

        {searchTerm && !isSearching && searchResults.length === 0 && (
          <Box sx={{ textAlign: "center", color: "text.secondary", mt: 4 }}>
            <Typography>Không tìm thấy kết quả nào</Typography>
          </Box>
        )}
      </SearchResults>
    </SearchContainer>
  );
};
