import {
  Avatar,
  Box,
  CircularProgress,
  List,
  ListItem,
  Typography,
  styled,
} from "@mui/material";
import {
  useNotifications,
  useMarkNotificationAsRead,
} from "../../hooks/useNotification";
import { formatTimeAgo } from "../../utils/dateUtils";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { NotificationData } from "../../types/notification.types";
import { useNavigate } from "react-router-dom";
import { PostModal } from "../post/PostModal/PostModal";

const NotificationItem = styled(ListItem)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  padding: theme.spacing(2),
  cursor: "pointer",
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&.unread": {
    backgroundColor: theme.palette.action.selected,
  },
}));

const NotificationContent = styled(Box)({
  flex: 1,
  marginLeft: 12,
});

const NotificationTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(0.5),
}));

const NotificationBody = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: "0.875rem",
}));

const NotificationMeta = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginTop: theme.spacing(0.5),
}));

const getNotificationIcon = (type: NotificationData["type"]) => {
  switch (type) {
    case "NEW_POST":
      return "📝";
    case "NEW_COMMENT":
      return "💬";
    case "POST_LIKE":
      return "❤️";
    case "NEW_FOLLOW":
      return "👥";
    default:
      return "📢";
  }
};

export const NotificationList = () => {
  const navigate = useNavigate();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNotifications();
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { ref, inView } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage) {
        fetchNextPage();
      }
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleNotificationClick = (notification: NotificationData) => {
    try {
      const parsedData = JSON.parse(notification.data);

      // Đánh dấu đã đọc
      if (!notification.is_read) {
        markAsRead(notification.notification_id);
      }

      // Xử lý điều hướng dựa vào loại thông báo
      switch (notification.type) {
        case "NEW_COMMENT":
          setSelectedPostId(parsedData.post_id);
          break;

        case "NEW_POST":
          setSelectedPostId(parsedData.post_id);
          break;

        case "POST_LIKE":
          setSelectedPostId(parsedData.post_id);
          break;

        case "NEW_FOLLOW":
          navigate(`/profile/${parsedData.follower_id}`);
          break;
      }
    } catch (error) {
      console.error("Error parsing notification data:", error);
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
        <Typography>Chưa có thông báo nào</Typography>
      </Box>
    );
  }

  return (
    <>
      <List disablePadding>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.notification_id}
            className={notification.is_read ? "" : "unread"}
            onClick={() => handleNotificationClick(notification)}
          >
            <Avatar
              src={`/api/users/${notification.sender_id}/avatar`}
              sx={{ width: 44, height: 44 }}
            />
            <NotificationContent>
              <NotificationTitle variant="body1">
                <Box component="span" sx={{ mr: 1 }}>
                  {getNotificationIcon(notification.type)}
                </Box>
                {notification.title}
              </NotificationTitle>
              <NotificationBody>{notification.body}</NotificationBody>
              <NotificationMeta>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.75rem" }}
                >
                  {formatTimeAgo(notification.created_at)}
                </Typography>
                {!notification.is_read && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                    }}
                  />
                )}
              </NotificationMeta>
            </NotificationContent>
          </NotificationItem>
        ))}

        {(hasNextPage || isFetchingNextPage) && (
          <Box
            ref={ref}
            sx={{ display: "flex", justifyContent: "center", p: 2 }}
          >
            <CircularProgress size={24} />
          </Box>
        )}
      </List>

      {/* Modal hiển thị chi tiết bài viết */}
      {selectedPostId && (
        <PostModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
        />
      )}
    </>
  );
};
