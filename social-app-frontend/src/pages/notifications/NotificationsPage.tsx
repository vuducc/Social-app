import { Box, Typography, styled } from "@mui/material";
import { NotificationList } from "../../components/notification/NotificationList";

const PageContainer = styled(Box)(({ theme }) => ({
  maxWidth: 600,
  margin: "0 auto",
  padding: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

export const NotificationsPage = () => {
  return (
    <PageContainer>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Thông báo
      </Typography>
      <NotificationList />
    </PageContainer>
  );
};
