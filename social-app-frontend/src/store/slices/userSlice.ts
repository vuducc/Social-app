import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/user.types";

interface UserState {
  profiles: Record<string, User>;
  currentProfile: User | null;
  suggestedUsers: User[];
}

const initialState: UserState = {
  profiles: {},
  currentProfile: null,
  suggestedUsers: [],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<User>) => {
      state.profiles[action.payload.user_id] = action.payload;
    },
    setCurrentProfile: (state, action: PayloadAction<User>) => {
      state.currentProfile = action.payload;
    },
    setSuggestedUsers: (state, action: PayloadAction<User[]>) => {
      state.suggestedUsers = action.payload;
    },
    updateFollowStatus: (
      state,
      action: PayloadAction<{ userId: string; isFollowing: boolean }>
    ) => {
      const { userId, isFollowing } = action.payload;
      if (state.profiles[userId]) {
        state.profiles[userId].is_following = isFollowing;
      }
    },
  },
});

export const {
  setProfile,
  setCurrentProfile,
  setSuggestedUsers,
  updateFollowStatus,
} = userSlice.actions;
export default userSlice.reducer;
