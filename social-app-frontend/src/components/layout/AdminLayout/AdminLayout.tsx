import { useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { styled } from "@mui/material/styles";

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  backgroundColor: theme.palette.background.default,
  minHeight: "100vh",
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
}));

export const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: "flex", bgcolor: "background.default" }}>
      <CssBaseline />

      <AdminSidebar open={isSidebarOpen} />

      <MainContent
        sx={{
          bgcolor: "background.default",
          marginLeft: 0,
        }}
      >
        <AdminHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: "background.paper",
            boxShadow: "0 0 20px rgba(0,0,0,0.05)",
          }}
        >
          <Outlet />
        </Box>
      </MainContent>
    </Box>
  );
};
