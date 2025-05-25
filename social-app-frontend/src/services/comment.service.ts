import {
  Comment,
  CommentResponse,
  CreateCommentDto,
  UpdateCommentDto,
} from "../types/comment.types";
import { axiosClient } from "./api";

class CommentService {
  async getPostComments(
    postId: string,
    page = 1,
    limit = 20
  ): Promise<CommentResponse> {
    const response = await axiosClient.get(`/comments/post/${postId}`, {
      params: { page, limit },
    });
    return response.data;
  }

  async getReplies(
    commentId: string,
    page = 1,
    limit = 20
  ): Promise<CommentResponse> {
    const response = await axiosClient.get(`/comments/${commentId}/replies`, {
      params: { page, limit },
    });
    return response.data;
  }

  async createComment(data: CreateCommentDto): Promise<Comment> {
    const response = await axiosClient.post("/comments", data);
    return response.data;
  }

  async updateComment(
    commentId: string,
    data: UpdateCommentDto
  ): Promise<Comment> {
    const response = await axiosClient.put(`/comments/${commentId}`, data);
    return response.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await axiosClient.delete(`/comments/${commentId}`);
  }

  async getComment(commentId: string): Promise<Comment> {
    const response = await axiosClient.get(`/comments/${commentId}`);
    return response.data;
  }

  async adminDeleteComment(commentId: string): Promise<{ message: string }> {
    const response = await axiosClient.delete(`/admin/comments/${commentId}`);
    return response.data;
  }
}

export const commentService = new CommentService();
