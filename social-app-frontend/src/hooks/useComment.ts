import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import { commentService } from "../services/comment.service";
import toast from "react-hot-toast";

export const useComments = (postId: string) => {
  return useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam = 1 }) =>
      commentService.getPostComments(postId, pageParam),
    getNextPageParam: (lastPage) => {
      if (!lastPage.has_more) return undefined;
      return lastPage.page + 1;
    },
    initialPageParam: 1,
  });
};

export const useReplies = (commentId: string) => {
  return useInfiniteQuery({
    queryKey: ["replies", commentId],
    queryFn: ({ pageParam = 1 }) =>
      commentService.getReplies(commentId, pageParam),
    getNextPageParam: (lastPage) => {
      if (!lastPage.has_more) return undefined;
      return lastPage.page + 1;
    },
    initialPageParam: 1,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentService.createComment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["comments", data.post_id] });
      if (data.parent_id) {
        queryClient.invalidateQueries({
          queryKey: ["replies", data.parent_id],
        });
      }
      toast.success("Đã thêm bình luận");
    },
    onError: () => {
      toast.error("Không thể thêm bình luận. Vui lòng thử lại!");
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: { content: string };
    }) => commentService.updateComment(commentId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["comments", data.post_id] });
      if (data.parent_id) {
        queryClient.invalidateQueries({
          queryKey: ["replies", data.parent_id],
        });
      }
      toast.success("Đã cập nhật bình luận");
    },
    onError: () => {
      toast.error("Không thể cập nhật bình luận. Vui lòng thử lại!");
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentService.deleteComment,
    onSuccess: () => {
      // Invalidate và refetch comments query
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["replies"] });
      toast.success("Đã xóa bình luận");
    },
    onError: () => {
      toast.error("Không thể xóa bình luận. Vui lòng thử lại!");
    },
  });
};

export const useAdminDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentService.adminDeleteComment,
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Đã xóa bình luận");
    },
    onError: () => {
      toast.error("Không thể xóa bình luận. Vui lòng thử lại!");
    },
  });
};

export const useComment = (commentId: string) => {
  return useQuery({
    queryKey: ["comment", commentId],
    queryFn: () => commentService.getComment(commentId),
    enabled: !!commentId, // Chỉ gọi API khi có commentId
  });
};
