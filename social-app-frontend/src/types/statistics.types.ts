export interface TimeSeriesData {
  labels: string[];
  values: number[];
}

export interface DashboardStatistics {
  user_growth: TimeSeriesData;
  post_activity: TimeSeriesData;
  interaction_rates: TimeSeriesData;
  engagement_stats: {
    avg_posts_per_user: number;
    avg_comments_per_post: number;
    avg_likes_per_post: number;
  };
}

export interface UserGrowthData {
  date: string;
  total_users: number;
  new_users_count: number;
}

export interface PostActivityData {
  date: string;
  total_posts: number;
  total_comments: number;
  total_likes: number;
}

export interface InteractionData {
  date: string;
  total_messages: number;
  active_conversations: number;
  total_notifications: number;
}

export interface UserDetails {
  total_users: number;
  total_active_users: number;
  total_posts: number;
  total_followers: number;
}

export interface PostDetails {
  total_posts: number;
  total_comments: number;
  total_likes: number;
  avg_comments_per_post: number;
  avg_likes_per_post: number;
}

export interface MessageDetails {
  total_conversations: number;
  total_messages: number;
  total_participants: number;
  avg_messages_per_conversation: number;
}
