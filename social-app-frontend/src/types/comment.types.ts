interface CommentUser {
  user_id: string;
  username: string;
  profile_picture_url: string | null;
}

export interface Comment {
  content: string;
  comment_id: string;
  post_id: string;
  user: CommentUser;
  created_at: string;
  updated_at: string;
  replies_count: number;
  parent_id: string | null;
}

export interface CommentResponse {
  comments: Comment[];
  total_count: number;
  page: number;
  total_pages: number;
  has_more: boolean;
}

export interface CreateCommentDto {
  content: string;
  post_id: string;
  parent_id?: string;
}

export interface UpdateCommentDto {
  content: string;
}
