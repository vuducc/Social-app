import { axiosClient } from "./api";
import {
  Post,
  PostsResponse,
  CreatePostResponse,
  LikePostResponse,
  CreatePostPayload,
} from "../types/post.types";

export const postService = {
  async getFeed(page = 1, limit = 5): Promise<PostsResponse> {
    try {
      const response = await axiosClient.get<PostsResponse>(`/posts/feed`, {
        params: {
          page,
          limit,
        },
      });
      return {
        ...response.data,
        has_more: response.data.total_pages > page,
      };
    } catch (error) {
      console.error("Error fetching feed:", error);
      throw error;
    }
  },

  async getUserPosts(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<PostsResponse> {
    try {
      const response = await axiosClient.get<PostsResponse>(
        `/posts/user/${userId}`,
        {
          params: { page, limit },
        }
      );
      return {
        ...response.data,
        has_more: response.data.total_pages > page,
      };
    } catch (error) {
      console.error("Error fetching user posts:", error);
      throw error;
    }
  },

  async getPost(postId: string): Promise<Post> {
    const response = await axiosClient.get<Post>(`/posts/${postId}`);
    return response.data;
  },

  async createPost({
    content,
    files,
  }: CreatePostPayload): Promise<CreatePostResponse> {
    const formData = new FormData();
    formData.append("content", content);

    files.forEach((file) => {
      formData.append(`files`, file);
    });

    try {
      const response = await axiosClient.post<CreatePostResponse>(
        "/posts/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 100)
            );
            console.log(`Upload Progress: ${percentCompleted}%`);
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Có lỗi xảy ra khi tạo bài viết");
    }
  },

  async likePost(postId: string): Promise<LikePostResponse> {
    const response = await axiosClient.post<LikePostResponse>(
      `/posts/${postId}/like`
    );
    return response.data;
  },

  async deletePost(
    postId: string
  ): Promise<{ message: string; post_id: string }> {
    const response = await axiosClient.delete(`/posts/${postId}`);
    return response.data;
  },

  async adminDeletePost(postId: string): Promise<{ message: string }> {
    const response = await axiosClient.delete(`/admin/posts/${postId}`);
    return response.data;
  },
};
