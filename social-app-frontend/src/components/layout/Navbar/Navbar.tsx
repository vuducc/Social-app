import {
  AppBar,
  Toolbar,
  styled,
  Box,
  IconButton,
  InputBase,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Home,
  Search as SearchIcon,
  AddBox,
  FavoriteBorder,
  Send,
  Logout,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../hooks/useRedux";
import { logout } from "../../../store/slices/authSlice";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: "none",
  height: 60,
}));

const StyledToolbar = styled(Toolbar)({
  height: 60,
  display: "flex",
  justifyContent: "space-between",
  padding: "0 20px",
});

const SearchBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  padding: "0 16px",
  display: "flex",
  alignItems: "center",
  width: 268,
  height: 36,
  border: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const NavActions = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const LogoLink = styled(Link)(({ theme }) => ({
  height: 29,
  display: "flex",
  alignItems: "center",
  "& img": {
    height: "100%",
  },
  [theme.breakpoints.down("sm")]: {
    height: 24,
  },
}));

export const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <StyledAppBar position="fixed">
      <StyledToolbar>
        <LogoLink to="/">
          <img src="/logo.png" alt="Instagram" />
        </LogoLink>

        {!isMobile && (
          <SearchBox>
            <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
            <InputBase
              placeholder="Tìm kiếm"
              sx={{ color: "text.primary", width: "100%" }}
            />
          </SearchBox>
        )}

        <NavActions>
          {!isMobile && (
            <>
              <IconButton>
                <Home />
              </IconButton>
              <IconButton>
                <Send />
              </IconButton>
              <IconButton>
                <AddBox />
              </IconButton>
              <IconButton>
                <FavoriteBorder />
              </IconButton>
            </>
          )}

          {isAuthenticated && (
            <>
              <IconButton onClick={() => navigate('/profile/me')}>
                <Avatar
                  src={user?.profile_picture_url || undefined}
                  alt={user?.username}
                  sx={{ width: 24, height: 24 }}
                />
              </IconButton>
              <IconButton onClick={handleLogout}>
                <Logout />
              </IconButton>
            </>
          )}
        </NavActions>
      </StyledToolbar>
    </StyledAppBar>
  );
};
