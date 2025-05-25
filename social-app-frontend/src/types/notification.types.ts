export type NotificationType =
  | "NEW_COMMENT"
  | "POST_LIKE"
  | "NEW_FOLLOW"
  | "NEW_POST";

export interface NotificationData {
  notification_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  read_at: string | null;
}

export interface NotificationResponse {
  items: NotificationData[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface NotificationCount {
  total: number;
  unread: number;
}

export interface RegisterDeviceDto {
  token: string;
  device_type: string;
  device_id: string;
}
