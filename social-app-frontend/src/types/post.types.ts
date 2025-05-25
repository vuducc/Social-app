export interface Post {
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  image_urls: string[];
  user_username: string;
  user_profile_picture_url: string | null;
  comments_count: number;
  likes_count: number;
  is_liked_by_me: boolean;
}

export interface CreatePostPayload {
  content: string;
  files: File[];
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export interface PostsResponse {
  posts: Post[];
  page: number;
  total_pages: number;
  total_posts: number;
  has_more: boolean;
}

export interface CreatePostResponse {
  message: string;
  post_id: string;
  content: string;
  created_at: string;
  user_id: string;
  image_urls: string[];
}

export interface LikePostResponse {
  message: string;
  is_liked: boolean;
  likes_count: number;
}
