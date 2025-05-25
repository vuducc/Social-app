import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import { useAppSelector } from "../../../hooks/useRedux";
import { styled } from "@mui/material/styles";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(8px)",
  borderBottom: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
  boxShadow: "none",
}));

const UserButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius * 3,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    // await logout();
    // navigate("/auth/login");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <StyledAppBar position="sticky">
      <Toolbar>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            ml: 2,
            fontWeight: 600,
            background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Admin Dashboard
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={handleHomeClick}
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <HomeIcon />
          </IconButton>

          <UserButton
            onClick={handleLogout}
            startIcon={
              <Avatar
                src={user?.profile_picture_url || ""}
                sx={{ width: 32, height: 32 }}
              />
            }
          >
            <Box sx={{ textAlign: "left", ml: 1 }}>
              <Typography variant="subtitle2">{user?.username}</Typography>
              <Typography variant="caption" color="text.secondary">
                Administrator
              </Typography>
            </Box>
          </UserButton>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};
