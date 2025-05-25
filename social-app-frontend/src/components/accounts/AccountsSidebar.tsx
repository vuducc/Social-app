import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  styled,
} from "@mui/material";
import {
  Person,
  Lock,
  Notifications,
  Security,
  Help,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

const SidebarContainer = styled(Paper)(({ theme }) => ({
  width: 280,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down("md")]: {
    width: "100%",
    border: "none",
    borderRadius: 0,
  },
}));

const StyledListItemButton = styled(ListItemButton)<{ selected?: boolean }>(
  ({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0.5, 1),
    "&.Mui-selected": {
      backgroundColor: theme.palette.action.selected,
      "&:hover": {
        backgroundColor: theme.palette.action.selected,
      },
    },
  })
);

const menuItems = [
  {
    path: "edit",
    label: "Chỉnh sửa trang cá nhân",
    icon: <Person />,
  },
  {
    path: "password",
    label: "Đổi mật khẩu",
    icon: <Lock />,
  },
  {
    path: "notifications",
    label: "Thông báo",
    icon: <Notifications />,
  },
  {
    path: "privacy",
    label: "Quyền riêng tư và bảo mật",
    icon: <Security />,
  },
  {
    path: "help",
    label: "Trợ giúp",
    icon: <Help />,
  },
];

export const AccountsSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.split("/").pop();

  return (
    <SidebarContainer>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <StyledListItemButton
              selected={currentPath === item.path}
              onClick={() => navigate(`/accounts/${item.path}`)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>
    </SidebarContainer>
  );
};
