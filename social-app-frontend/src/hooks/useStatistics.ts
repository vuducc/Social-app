import { useQuery } from "@tanstack/react-query";
import { statisticsService } from "../services/statistics.service";

export const useDashboardStats = (days: number) => {
  return useQuery({
    queryKey: ["dashboardStats", days],
    queryFn: () => statisticsService.getDashboardStats(days),
  });
};

export const useUserGrowth = (days: number) => {
  return useQuery({
    queryKey: ["userGrowth", days],
    queryFn: () => statisticsService.getUserGrowth(days),
  });
};

export const usePostActivity = (days: number) => {
  return useQuery({
    queryKey: ["postActivity", days],
    queryFn: () => statisticsService.getPostActivity(days),
  });
};

export const useInteractions = (days: number) => {
  return useQuery({
    queryKey: ["interactions", days],
    queryFn: () => statisticsService.getInteractions(days),
  });
};

export const useUserDetails = () => {
  return useQuery({
    queryKey: ["userDetails"],
    queryFn: () => statisticsService.getUserDetails(),
  });
};

export const usePostDetails = () => {
  return useQuery({
    queryKey: ["postDetails"],
    queryFn: () => statisticsService.getPostDetails(),
  });
};

export const useMessageDetails = () => {
  return useQuery({
    queryKey: ["messageDetails"],
    queryFn: () => statisticsService.getMessageDetails(),
  });
};
