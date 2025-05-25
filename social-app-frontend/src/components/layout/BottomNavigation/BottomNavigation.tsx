import {
  Paper,
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  styled,
} from "@mui/material";
import {
  Home,
  Search,
  AddBox,
  FavoriteBorder,
  Person,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const StyledPaper = styled(Paper)(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  display: "none",
  zIndex: theme.zIndex.appBar,
  borderTop: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down("md")]: {
    display: "block",
  },
}));

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <StyledPaper elevation={0}>
      <MuiBottomNavigation
        value={location.pathname}
        onChange={(_, newValue) => {
          navigate(newValue);
        }}
        showLabels={false}
      >
        <BottomNavigationAction value="/" icon={<Home />} />
        <BottomNavigationAction value="/search" icon={<Search />} />
        <BottomNavigationAction value="/create" icon={<AddBox />} />
        <BottomNavigationAction value="/activity" icon={<FavoriteBorder />} />
        <BottomNavigationAction value="/profile/me" icon={<Person />} />
      </MuiBottomNavigation>
    </StyledPaper>
  );
};
