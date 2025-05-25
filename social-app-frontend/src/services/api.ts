import axios from "axios";

// Hàm helper để chuyển đổi thời gian UTC sang múi giờ Việt Nam
const convertToVietnamTime = (obj: any): any => {
  if (obj === null || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => convertToVietnamTime(item));
  }

  const result = { ...obj };
  for (const key in result) {
    const value = result[key];

    // Kiểm tra các trường thời gian phổ biến
    if (
      typeof value === "string" &&
      (key.includes("_at") ||
        key.includes("date") ||
        key.includes("time") ||
        key.includes("created") ||
        key.includes("updated") ||
        key.includes("timestamp") ||
        key.includes("resolved") ||
        key.includes("created_at") ||
        key.includes("updated_at") ||
        key.includes("timestamp_at") ||
        key.includes("resolved_at"))
    ) {
      try {
        console.log(value);
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          // Chuyển đổi sang múi giờ Việt Nam (+7)
          result[key] = new Date(
            date.getTime() + 7 * 60 * 60 * 1000
          ).toISOString();
        }
      } catch (e) {
        // Giữ nguyên giá trị nếu không thể chuyển đổi
        console.warn(`Could not convert time for field ${key}:`, e);
      }
    } else if (typeof value === "object") {
      result[key] = convertToVietnamTime(value);
    }
  }
  return result;
};

export const axiosClient = axios.create({
  baseURL: "http://34.229.88.140:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    // Chuyển đổi thời gian trong response data
    if (response.data) {
      response.data = convertToVietnamTime(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa thử refresh token
    if (
      error.response?.status === 401 &&
      error.response?.data?.message === "Token expired" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Gọi API refresh token
        const response = await axiosClient.post("/auth/refresh-token");
        const { access_token } = response.data;

        // Lưu token mới
        localStorage.setItem("accessToken", access_token);

        // Cập nhật token trong header của request gốc
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Thực hiện lại request gốc
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Nếu refresh token thất bại, logout user
        localStorage.removeItem("accessToken");
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
