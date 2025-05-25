import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { notificationService } from "../services/notification.service";

export const useNotifications = (size = 20, is_report = false) => {
  return useInfiniteQuery({
    queryKey: ["notifications", { is_report }],
    queryFn: ({ pageParam = 1 }) =>
      notificationService.getNotifications({ 
        page: pageParam, 
        size, 
        is_report 
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

export const useNotificationCount = () => {
  return useQuery({
    queryKey: ["notificationCount"],
    queryFn: () => notificationService.getNotificationCounts(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notificationCount"] });
    },
  });
};
