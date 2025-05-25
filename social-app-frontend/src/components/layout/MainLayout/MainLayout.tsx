import { Box, styled } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../Sidebar/Sidebar";
import { SearchSidebar } from "../SearchSidebar/SearchSidebar";
import { useState } from "react";

const MainContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  backgroundColor: theme.palette.background.default,
  minHeight: "100vh",
}));

const LeftSidebarContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isSearchOpen",
})<{ isSearchOpen?: boolean }>(({ theme, isSearchOpen }) => ({
  width: isSearchOpen ? 73 : 245,
  borderRight: `1px solid ${theme.palette.divider}`,
  position: "fixed",
  left: 0,
  top: 0,
  bottom: 0,
  overflowY: "auto",
  backgroundColor: theme.palette.background.paper,
  transition: "width 0.3s ease-in-out",
  zIndex: 1200,
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  marginLeft: 245,
  minHeight: "100vh",
  padding: theme.spacing(2, 0),
  position: "relative",
  [theme.breakpoints.down("md")]: {
    marginLeft: 0,
    padding: theme.spacing(1, 0),
  },
}));

const Overlay = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isVisible",
})<{ isVisible: boolean }>(({ isVisible }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  zIndex: 1199,
  opacity: isVisible ? 1 : 0,
  visibility: isVisible ? "visible" : "hidden",
  transition: "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out",
}));

export const MainLayout = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  return (
    <MainContainer>
      <LeftSidebarContainer isSearchOpen={isSearchOpen}>
        <Sidebar
          isSearchOpen={isSearchOpen}
          onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
        />
      </LeftSidebarContainer>

      <Overlay isVisible={isSearchOpen} onClick={handleCloseSearch} />

      <SearchSidebar isOpen={isSearchOpen} onClose={handleCloseSearch} />

      <ContentContainer>
        <Outlet />
      </ContentContainer>
    </MainContainer>
  );
};
