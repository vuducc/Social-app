import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/auth.service";
import { userService } from "../services/user.service";
import { notificationService } from "../services/notification.service";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import {
  setCredentials,
  setUser,
  logout as logoutAction,
} from "../store/slices/authSlice";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    username: string;
    password: string;
  }) => Promise<{ email: string }>;
  verifyOTP: (data: { otp: string; email: string }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  roles: string[];
}

const AuthContext = createContext<AuthContextType | null>(null);

interface SavedCredentials {
  email: string;
  password: string;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { isAuthenticated, roles: reduxRoles } = useAppSelector(
    (state) => state.auth
  );
  const [isLoading, setIsLoading] = useState(true);
  const [tempCredentials, setTempCredentials] =
    useState<SavedCredentials | null>(null);

  const registerNotifications = async () => {
    try {
      await notificationService.getFCMToken();
    } catch (error) {
      console.error("Failed to register for notifications:", error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const userData = await userService.getCurrentUser();
          dispatch(setUser(userData));
          await registerNotifications();
        } catch (error) {
          console.error("Failed to load user profile:", error);
          dispatch(logoutAction());
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [dispatch]);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });

    dispatch(
      setCredentials({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        roles: response.roles,
      })
    );

    const userData = await userService.getCurrentUser();
    dispatch(setUser(userData));

    await registerNotifications();
  };

  const register = async (data: {
    email: string;
    username: string;
    password: string;
  }) => {
    const response = await authService.register(data);
    setTempCredentials({
      email: data.email,
      password: data.password,
    });
    return { email: response.email };
  };

  const verifyOTP = async (data: { otp: string; email: string }) => {
    await authService.verifyOTP(data);

    if (!tempCredentials) {
      throw new Error("No saved credentials found");
    }

    await login(tempCredentials.email, tempCredentials.password);

    setTempCredentials(null);
  };

  const handleLogout = async (): Promise<void> => {
    try {
      const deviceId = localStorage.getItem("device_id");
      if (deviceId) {
        await notificationService.unregisterDevice(deviceId);
      }
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("userRoles");
      queryClient.clear();
      dispatch(logoutAction());
    }
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        register,
        verifyOTP,
        logout: handleLogout,
        isAuthenticated,
        isLoading,
        roles: reduxRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
