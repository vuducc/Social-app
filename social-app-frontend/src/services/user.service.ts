import {
  User,
  PaginatedUsers,
  PaginatedActivities,
  ChangePasswordRequest,
  AdminUser,
  CreateUserDto,
  SuggestedUsersResponse,
} from "../types/user.types";
import { axiosClient } from "./api";

export const userService = {
  // Lấy thông tin user hiện tại
  async getCurrentUser(): Promise<User> {
    const response = await axiosClient.get<User>("/users/me");
    return response.data;
  },

  // Lấy thông tin user bất kỳ
  async getUserProfile(userId: string): Promise<User> {
    const response = await axiosClient.get<User>(`/users/${userId}`);
    return response.data;
  },

  // Lấy tất cả users cho admin
  async getAllUsers(skip = 0, limit = 100): Promise<AdminUser[]> {
    const response = await axiosClient.get<AdminUser[]>("/admin/users", {
      params: { skip, limit },
    });
    return response.data;
  },

  // Tìm kiếm users thông thường
  async searchUsers(
    query: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedUsers> {
    const response = await axiosClient.get<PaginatedUsers>(`/users/search`, {
      params: { query, page, limit },
    });
    return response.data;
  },

  // Cập nhật thông tin profile
  async updateProfile(data: {
    username?: string;
    email?: string;
    full_name?: string;
    bio?: string;
  }): Promise<User> {
    const response = await axiosClient.put<User>("/users/me", data);
    return response.data;
  },

  // Cập nhật avatar
  async updateAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("profile_picture", file);

    const response = await axiosClient.put<User>("/users/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Lấy danh sách followers
  async getFollowers(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedUsers> {
    const response = await axiosClient.get<PaginatedUsers>(
      `/users/${userId}/followers`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  // Lấy danh sách following
  async getFollowing(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedUsers> {
    const response = await axiosClient.get<PaginatedUsers>(
      `/users/${userId}/following`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  // Lấy hoạt động của user
  async getActivities(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedActivities> {
    const response = await axiosClient.get<PaginatedActivities>(
      `/users/${userId}/activity`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  // Đổi mật khẩu
  async changePassword(
    data: ChangePasswordRequest
  ): Promise<{ message: string }> {
    try {
      const response = await axiosClient.put<{ message: string }>(
        "/users/me/password",
        data
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        // Chuyển đổi thông báo lỗi từ backend
        const errorMessage =
          error.response.data.detail === "Invalid old password"
            ? "Mật khẩu hiện tại không chính xác"
            : error.response.data.detail;

        throw new Error(errorMessage);
      }
      throw new Error("Có lỗi xảy ra khi đổi mật khẩu");
    }
  },

  // Toggle follow user
  async toggleFollow(userId: string): Promise<{
    message: string;
    target_user_id: string;
  }> {
    const response = await axiosClient.post(`/users/${userId}/toggle-follow`);
    return response.data;
  },

  async createUser(data: CreateUserDto): Promise<AdminUser> {
    const response = await axiosClient.post<AdminUser>("/admin/users", data);
    return response.data;
  },

  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await axiosClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  async banUser(userId: string): Promise<{ message: string }> {
    const response = await axiosClient.post(`/admin/users/${userId}/ban`);
    return response.data;
  },

  async unbanUser(userId: string): Promise<{ message: string }> {
    const response = await axiosClient.post(`/admin/users/${userId}/unban`);
    return response.data;
  },

  async getSuggestedUsers(limit: number = 5): Promise<SuggestedUsersResponse> {
    const response = await axiosClient.get("/users/suggested", {
      params: { limit },
    });
    return response.data;
  },
};
