import { axiosClient } from "./api";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  roles: string[];
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  message: string;
  email: string;
}

interface VerifyOTPRequest {
  otp: string;
  email: string;
}

interface VerifyOTPResponse {
  message: string;
  user_id: string;
}

interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  roles: string[];
}

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await axiosClient.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await axiosClient.post<RegisterResponse>(
      "/auth/register",
      data
    );
    return response.data;
  },

  async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    const response = await axiosClient.post<VerifyOTPResponse>(
      "/auth/verify-otp",
      data
    );
    return response.data;
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await axiosClient.post<RefreshTokenResponse>(
      "/auth/refresh-token"
    );
    return response.data;
  },

  async logout(): Promise<{ message: string }> {
    const response = await axiosClient.post<{ message: string }>(
      "/auth/logout"
    );
    return response.data;
  },
};
