import { Box, Typography, Paper } from "@mui/material";
import { AdminNotificationList } from "../../components/admin/AdminNotificationList";

export const AdminNotificationsPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: 600,
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: "-8px",
            left: 0,
            width: "40px",
            height: "4px",
            backgroundColor: "primary.main",
            borderRadius: "2px",
          },
        }}
      >
        Report
      </Typography>

      <Paper sx={{ borderRadius: 2 }}>
        <AdminNotificationList />
      </Paper>
    </Box>
  );
};
