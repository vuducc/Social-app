import { axiosClient } from "./api";
import {
  NotificationCount,
  NotificationResponse,
  RegisterDeviceDto,
} from "../types/notification.types";
import { requestNotificationPermission } from "../configs/firebase";

interface GetNotificationsParams {
  page?: number;
  size?: number;
  is_report?: boolean;
}

class NotificationService {
  private deviceId: string | null = null;
  private fcmToken: string | null = null;

  constructor() {
    // Lấy device ID từ localStorage khi khởi tạo service
    this.deviceId = localStorage.getItem("device_id");
    this.fcmToken = localStorage.getItem("fcm_token");
  }

  private getDeviceId(): string {
    if (!this.deviceId) {
      // Chỉ tạo device ID mới nếu chưa có
      this.deviceId = `web-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      localStorage.setItem("device_id", this.deviceId);
    }
    return this.deviceId;
  }

  async registerDevice(deviceInfo: RegisterDeviceDto) {
    // Kiểm tra xem token có thay đổi không
    if (this.fcmToken === deviceInfo.token) {
      return; // Không cần đăng ký lại nếu token không đổi
    }

    try {
      const response = await axiosClient.post(
        "/notifications/register-device",
        deviceInfo
      );

      // Lưu token mới sau khi đăng ký thành công
      this.fcmToken = deviceInfo.token;
      localStorage.setItem("fcm_token", deviceInfo.token);

      return response.data;
    } catch (error) {
      console.error("Error registering device:", error);
      throw error;
    }
  }

  async unregisterDevice(deviceId: string) {
    const response = await axiosClient.delete(
      `/notifications/devices/${deviceId}`
    );
    return response.data;
  }

  async getNotifications({
    page = 1,
    size = 20,
    is_report
  }: GetNotificationsParams = {}): Promise<NotificationResponse> {
    const response = await axiosClient.get("/notifications", {
      params: {
        page,
        size,
        ...(is_report !== undefined && { is_report }),
      },
    });
    return response.data;
  }

  async markAsRead(notificationId: string) {
    const response = await axiosClient.put(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  }

  async getNotificationCounts(): Promise<NotificationCount> {
    const response = await axiosClient.get("/notifications/counts");
    return response.data;
  }

  async getFCMToken() {
    try {
      // Kiểm tra token hiện tại trước
      if (this.fcmToken) {
        return this.fcmToken;
      }

      const token = await requestNotificationPermission();
      if (token) {
        const deviceId = this.getDeviceId();
        await this.registerDevice({
          token,
          device_type: "web",
          device_id: deviceId,
        });
        return token;
      }
      throw new Error("Failed to get FCM token");
    } catch (error) {
      console.error("Error getting FCM token:", error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
