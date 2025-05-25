import { axiosClient } from "./api";
import {
  DashboardStatistics,
  UserGrowthData,
  PostActivityData,
  InteractionData,
  UserDetails,
  PostDetails,
  MessageDetails,
} from "../types/statistics.types";

class StatisticsService {
  async getDashboardStats(days: number): Promise<DashboardStatistics> {
    const response = await axiosClient.get("/statistics/dashboard", {
      params: { days },
    });
    return response.data;
  }

  async getUserGrowth(days: number): Promise<UserGrowthData[]> {
    const response = await axiosClient.get("/statistics/users/growth", {
      params: { days },
    });
    return response.data;
  }

  async getPostActivity(days: number): Promise<PostActivityData[]> {
    const response = await axiosClient.get("/statistics/posts/activity", {
      params: { days },
    });
    return response.data;
  }

  async getInteractions(days: number): Promise<InteractionData[]> {
    const response = await axiosClient.get("/statistics/interactions", {
      params: { days },
    });
    return response.data;
  }

  async getUserDetails(): Promise<UserDetails> {
    const response = await axiosClient.get("/statistics/users/details");
    return response.data;
  }

  async getPostDetails(): Promise<PostDetails> {
    const response = await axiosClient.get("/statistics/posts/details");
    return response.data;
  }

  async getMessageDetails(): Promise<MessageDetails> {
    const response = await axiosClient.get("/statistics/messages/details");
    return response.data;
  }
}

export const statisticsService = new StatisticsService();
