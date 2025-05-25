export interface User {
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  bio?: string;
  profile_picture_url: string | null;
  created_at: string;
  followers_count: number;
  following_count: number;
  is_following?: boolean;
  is_followed_by?: boolean;
  is_current_user?: boolean;
}

export interface UserActivity {
  type: "follow" | "post";
  timestamp: string;
  data: {
    user_id?: string;
    username?: string;
    post_id?: string;
    content?: string;
  };
}

export interface PaginatedUsers {
  users: {
    user_id: string;
    username: string;
    full_name: string;
    profile_picture_url: string | null;
    is_following: boolean;
  }[];
  total_count: number;
}

export interface PaginatedActivities {
  activities: UserActivity[];
  total_count: number;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ApiError {
  detail: string;
  status?: number;
}

export interface AdminUser extends User {
  is_admin: boolean;
  is_banned: boolean;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  full_name: string;
  is_admin: boolean;
}

export interface SuggestedUser {
  user_id: string;
  username: string;
  full_name: string;
  profile_picture_url: string | null;
  is_followed_by: boolean;
}

export interface SuggestedUsersResponse {
  users: SuggestedUser[];
}
