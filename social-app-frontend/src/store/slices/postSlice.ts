import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Post } from "../../types/post.types";

interface PostState {
  feed: Post[];
  userPosts: Record<string, Post[]>;
  currentPost: Post | null;
  loading: boolean;
  error: string | null;
  isCreatingPost: boolean;
}

const initialState: PostState = {
  feed: [],
  userPosts: {},
  currentPost: null,
  loading: false,
  error: null,
  isCreatingPost: false,
};

export const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    setFeed: (state, action: PayloadAction<Post[]>) => {
      state.feed = action.payload;
    },
    addToFeed: (state, action: PayloadAction<Post[]>) => {
      const newPosts = action.payload.filter(
        (newPost) =>
          !state.feed.some((post) => post.post_id === newPost.post_id)
      );
      state.feed = [...newPosts, ...state.feed];
    },
    addNewPost: (state, action: PayloadAction<Post>) => {
      state.feed.unshift(action.payload);
      if (state.userPosts[action.payload.user_id]) {
        state.userPosts[action.payload.user_id].unshift(action.payload);
      }
    },
    updatePost: (state, action: PayloadAction<Post>) => {
      const index = state.feed.findIndex(
        (post) => post.post_id === action.payload.post_id
      );
      if (index !== -1) {
        state.feed[index] = action.payload;
      }
    },
    removePost: (state, action: PayloadAction<string>) => {
      state.feed = state.feed.filter((post) => post.post_id !== action.payload);
    },
    updatePostLike: (
      state,
      action: PayloadAction<{
        postId: string;
        isLiked: boolean;
        likesCount: number;
      }>
    ) => {
      const { postId, isLiked, likesCount } = action.payload;

      const updatePost = (post: Post) => {
        if (post.post_id === postId) {
          return {
            ...post,
            is_liked_by_me: isLiked,
            likes_count: likesCount,
          };
        }
        return post;
      };

      state.feed = state.feed.map(updatePost);

      // Cập nhật trong userPosts nếu có
      Object.keys(state.userPosts).forEach((userId) => {
        state.userPosts[userId] = state.userPosts[userId].map(updatePost);
      });
    },
  },
});

export const {
  setFeed,
  addToFeed,
  updatePost,
  removePost,
  addNewPost,
  updatePostLike,
} = postSlice.actions;

export default postSlice.reducer;
