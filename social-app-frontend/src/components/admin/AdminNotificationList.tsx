import { Box, Typography, List, Avatar, styled } from "@mui/material";
import {
  useNotifications,
  useMarkNotificationAsRead,
} from "../../hooks/useNotification";
import { useInView } from "react-intersection-observer";
import { CircularProgress } from "@mui/material";
import { formatTimeAgo } from "../../utils/dateUtils";

const NotificationItem = styled(Box)(({ theme }) => ({
  display: "flex",
  padding: theme.spacing(2),
  gap: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  cursor: "pointer",
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&.unread": {
    backgroundColor: theme.palette.primary.main + "08",
  },
}));

const NotificationContent = styled(Box)({
  flex: 1,
});

export const AdminNotificationList = () => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNotifications(20, true);

  const markAsReadMutation = useMarkNotificationAsRead();

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage) {
        fetchNextPage();
      }
    },
  });

  const handleNotificationClick = async (notificationId: string) => {
    if (!notificationId) return;

    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const notifications = data?.pages.flatMap((page) => page.items) || [];

  if (!notifications.length) {
    return (
      <Box sx={{ textAlign: "center", p: 4, color: "text.secondary" }}>
        <Typography>Chưa có thông báo báo cáo nào</Typography>
      </Box>
    );
  }

  return (
    <List disablePadding>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.notification_id}
          className={notification.is_read ? "" : "unread"}
          onClick={() => handleNotificationClick(notification.notification_id)}
        >
          <Avatar
            src={`/api/users/${notification.sender_id}/avatar`}
            sx={{ width: 40, height: 40 }}
          />
          <NotificationContent>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              {notification.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {notification.body}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: "block" }}
            >
              {formatTimeAgo(notification.created_at)}
            </Typography>
          </NotificationContent>
        </NotificationItem>
      ))}
      {(hasNextPage || isFetchingNextPage) && (
        <Box ref={ref} sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </List>
  );
};
