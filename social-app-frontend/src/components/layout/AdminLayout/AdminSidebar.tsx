import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Typography,
  Badge,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ReportIcon from "@mui/icons-material/Report";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotificationCount } from "../../../hooks/useNotification";

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    width: 320,
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5, 1),
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.main + "15",
    "&:hover": {
      backgroundColor: theme.palette.primary.main + "25",
    },
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main,
    },
    "& .MuiListItemText-primary": {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
  },
}));

const DRAWER_WIDTH = 320;

interface AdminSidebarProps {
  open: boolean;
}

export const AdminSidebar = ({ open }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: notificationCount } = useNotificationCount();

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/admin",
      description: "Tổng quan hệ thống",
    },
    {
      text: "Quản lý người dùng",
      icon: <PeopleIcon />,
      path: "/admin/users",
      description: "Quản lý tài khoản người dùng",
    },
    {
      text: "Báo cáo vi phạm",
      icon: <ReportIcon />,
      path: "/admin/reports",
      description: "Xử lý báo cáo từ người dùng",
    },
    {
      text: "Thông báo",
      icon: (
        <Badge badgeContent={notificationCount?.unread} color="error">
          <NotificationsIcon />
        </Badge>
      ),
      path: "/admin/notifications",
      description: "Xem các thông báo báo cáo",
    },
    {
      text: "Cài đặt",
      icon: <SettingsIcon />,
      path: "/admin/settings",
      description: "Thiết lập hệ thống",
    },
  ];

  return (
    <StyledDrawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? DRAWER_WIDTH : 64,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? DRAWER_WIDTH : 64,
          boxSizing: "border-box",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          overflowX: "hidden",
        },
      }}
    >
      <Box sx={{ height: 64, display: "flex", alignItems: "center", px: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            opacity: open ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        >
          Admin Panel
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <StyledListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <Box sx={{ opacity: open ? 1 : 0 }}>
                <ListItemText primary={item.text} />
                {open && (
                  <Typography variant="caption" color="text.secondary">
                    {item.description}
                  </Typography>
                )}
              </Box>
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>
    </StyledDrawer>
  );
};
