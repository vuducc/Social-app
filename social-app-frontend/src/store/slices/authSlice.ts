import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/user.types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  roles: string[];
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  roles: JSON.parse(localStorage.getItem("userRoles") || "[]"),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        access_token: string;
        refresh_token: string;
        roles: string[];
      }>
    ) => {
      const { access_token, refresh_token, roles } = action.payload;
      state.accessToken = access_token;
      state.refreshToken = refresh_token;
      state.roles = roles;
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);
      localStorage.setItem("userRoles", JSON.stringify(roles));
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.roles = [];
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userRoles");
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
