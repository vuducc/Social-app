import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Badge,
} from "@mui/material";
import {
  HomeOutlined,
  SearchOutlined,
  ExploreOutlined,
  MovieCreationOutlined,
  SendOutlined,
  FavoriteBorderOutlined,
  AddBoxOutlined,
  PersonOutlineOutlined,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import logo from "../../../assets/images/logo_sonet.png";
import { useState } from "react";
import { CreatePostDialog } from "../../post/CreatePostDialog/CreatePostDialog";
import { useNotificationCount } from "../../../hooks/useNotification";

const Logo = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  cursor: "pointer",
  transition: "all 0.2s ease",
  marginBottom: theme.spacing(2),
  "&:hover": {
    "& .logo-text": {
      transform: "scale(1.02)",
    },
  },
  "& img": {
    height: 35,
    width: "auto",
  },
  "& .logo-text": {
    fontSize: "1.6rem",
    fontWeight: 600,
    letterSpacing: "-0.5px",
    transition: "transform 0.2s ease",
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)"
        : "linear-gradient(45deg, #405DE6, #5851DB, #833AB4)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
}));

const MenuItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  marginBottom: theme.spacing(0.5),
  borderRadius: 12,
  cursor: "pointer",
  transition: "all 0.2s ease",
  position: "relative",

  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.04)",
    "& .MuiListItemIcon-root": {
      transform: "scale(1.1)",
      color:
        theme.palette.mode === "dark"
          ? theme.palette.primary.light
          : theme.palette.primary.main,
    },
  },

  "&.active": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.06)",
    "& .MuiListItemIcon-root": {
      transform: "scale(1.1)",
      color:
        theme.palette.mode === "dark"
          ? theme.palette.primary.light
          : theme.palette.primary.main,
    },
    "& .MuiListItemText-primary": {
      fontWeight: 700,
      color:
        theme.palette.mode === "dark"
          ? theme.palette.primary.light
          : theme.palette.primary.main,
    },
  },

  "& .MuiListItemIcon-root": {
    minWidth: 40,
    transition: "all 0.2s ease",
    color:
      theme.palette.mode === "dark"
        ? theme.palette.text.primary
        : theme.palette.text.primary,
  },

  "& .MuiListItemText-primary": {
    fontSize: "0.95rem",
    fontWeight: 500,
    letterSpacing: "0.2px",
  },
}));

const SidebarContainer = styled(Box)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(1),
  "& .MuiList-root": {
    padding: theme.spacing(1),
  },
}));

interface SidebarProps {
  isSearchOpen: boolean;
  onSearchToggle: () => void;
}

export const Sidebar = ({ isSearchOpen, onSearchToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { data: notificationCount } = useNotificationCount();

  const menuItems = [
    { icon: <HomeOutlined />, text: "Trang chủ", path: "/" },
    {
      icon: <SearchOutlined />,
      text: "Tìm kiếm",
      onClick: onSearchToggle,
      isSearch: true,
    },
    { icon: <ExploreOutlined />, text: "Khám phá", path: "/explore" },
    { icon: <MovieCreationOutlined />, text: "Reels", path: "/reels" },
    { icon: <SendOutlined />, text: "Tin nhắn", path: "/messages" },
    {
      icon: (
        <Badge
          badgeContent={notificationCount?.unread || 0}
          color="error"
          max={99}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.6rem",
              height: 16,
              minWidth: 16,
            },
          }}
        >
          <FavoriteBorderOutlined />
        </Badge>
      ),
      text: "Thông báo",
      path: "/notifications",
    },
    {
      icon: <AddBoxOutlined />,
      text: "Tạo",
      onClick: () => setIsCreatePostOpen(true),
    },
    {
      icon: <PersonOutlineOutlined />,
      text: "Trang cá nhân",
      path: `/profile/me`,
    },
  ];

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleMenuClick = (item: any) => {
    if (item.onClick) {
      item.onClick();
    } else {
      navigate(item.path);
    }
  };

  return (
    <SidebarContainer>
      <Logo
        onClick={handleLogoClick}
        sx={{
          justifyContent: isSearchOpen ? "center" : "flex-start",
          "& .logo-text": {
            display: isSearchOpen ? "none" : "block",
          },
        }}
      >
        <img src={logo} alt="Sonet" />
        {!isSearchOpen && <Typography className="logo-text">Sonet</Typography>}
      </Logo>

      <List>
        {menuItems.map((item) => (
          <MenuItem
            key={item.text}
            onClick={() => handleMenuClick(item)}
            className={
              (item.isSearch && isSearchOpen) ||
              location.pathname === item?.path
                ? "active"
                : ""
            }
            sx={{
              justifyContent: isSearchOpen ? "center" : "flex-start",
              px: isSearchOpen ? 1.5 : 2,
              minWidth: isSearchOpen ? 48 : "auto",
              "& .MuiListItemIcon-root": {
                minWidth: isSearchOpen ? 24 : 40,
                justifyContent: isSearchOpen ? "center" : "flex-start",
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            {!isSearchOpen && <ListItemText primary={item.text} />}
          </MenuItem>
        ))}
      </List>

      <CreatePostDialog
        open={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />
    </SidebarContainer>
  );
};
