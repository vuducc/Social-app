import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { postService } from "../services/post.service";
import { useAppDispatch, useAppSelector } from "./useRedux";
import {
  addToFeed,
  removePost,
  addNewPost,
  updatePostLike,
} from "../store/slices/postSlice";
import { Post } from "../types/post.types";
import toast from "react-hot-toast";
import { useEffect } from "react";

export const usePosts = () => {
  const dispatch = useAppDispatch();

  const query = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await postService.getFeed(pageParam);
      return response;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.has_more) return undefined;
      return lastPage.page + 1;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60, // 1 phút
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data) {
      const newPosts = query.data.pages[query.data.pages.length - 1].posts;
      dispatch(addToFeed(newPosts));
    }
  }, [query.data, dispatch]);

  return query;
};

export const useUserPosts = (userId: string) => {
  return useInfiniteQuery({
    queryKey: ["userPosts", userId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!userId) throw new Error("User ID is required");
      const response = await postService.getUserPosts(userId, pageParam);
      return response;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.has_more) return undefined;
      return lastPage.page + 1;
    },
    enabled: !!userId, // Chỉ gọi API khi có userId
    initialPageParam: 1,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  return useMutation({
    mutationFn: ({ content, files }: { content: string; files: File[] }) =>
      postService.createPost({ content, files }),
    onMutate: () => {
      toast.loading("Đang tạo bài viết...", { id: "creating-post" });
    },
    onSuccess: (response) => {
      // Tạo object post từ response API và thông tin user hiện tại
      const newPost: Post = {
        post_id: response.post_id,
        user_id: response.user_id,
        content: response.content,
        created_at: response.created_at,
        image_urls: response.image_urls,
        user_username: currentUser?.username || "",
        user_profile_picture_url: currentUser?.profile_picture_url || null,
        comments_count: 0,
        likes_count: 0,
        is_liked_by_me: false,
      };

      // Thêm post mới vào redux store
      dispatch(addNewPost(newPost));

      // Cập nhật cache
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({
        queryKey: ["userPosts", currentUser?.user_id],
      });

      toast.success("Đăng bài thành công!", { id: "creating-post" });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Có lỗi xảy ra khi tạo bài viết", {
        id: "creating-post",
      });
    },
  });
};

export const useToggleLike = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postService.likePost,
    onMutate: (postId) => {
      // Lấy post hiện tại từ cache
      const queryData = queryClient.getQueryData<{
        pages: { posts: Post[] }[];
      }>(["posts"]);
      const posts = queryData?.pages?.flatMap((page) => page.posts) || [];
      const currentPost = posts.find((post) => post.post_id === postId);

      if (currentPost) {
        // Optimistic update
        const updatedPost = {
          ...currentPost,
          is_liked_by_me: !currentPost.is_liked_by_me,
          likes_count: currentPost.is_liked_by_me
            ? currentPost.likes_count - 1
            : currentPost.likes_count + 1,
        };

        // Cập nhật cache
        queryClient.setQueryData<{ pages: { posts: Post[] }[] }>(
          ["posts"],
          (old) => {
            if (!old) return { pages: [] };
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                posts: page.posts.map((post) =>
                  post.post_id === postId ? updatedPost : post
                ),
              })),
            };
          }
        );

        // Cập nhật Redux store
        dispatch(
          updatePostLike({
            postId,
            isLiked: !currentPost.is_liked_by_me,
            likesCount: currentPost.is_liked_by_me
              ? currentPost.likes_count - 1
              : currentPost.likes_count + 1,
          })
        );
      }

      return { previousPosts: posts };
    },
    onError: (error, postId, context) => {
      // Rollback nếu có lỗi
      console.log("error", error);
      if (context?.previousPosts) {
        const currentPost = context.previousPosts.find(
          (post) => post.post_id === postId
        );
        if (currentPost) {
          // Rollback cache
          queryClient.setQueryData<{ pages: { posts: Post[] }[] }>(
            ["posts"],
            (old) => {
              if (!old) return { pages: [] };
              return {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  posts: page.posts.map((post) =>
                    post.post_id === postId ? currentPost : post
                  ),
                })),
              };
            }
          );

          // Rollback Redux store
          dispatch(
            updatePostLike({
              postId,
              isLiked: currentPost.is_liked_by_me,
              likesCount: currentPost.likes_count,
            })
          );
        }
      }
      toast.error("Không thể thực hiện. Vui lòng thử lại!");
    },
    onSuccess: (response, postId) => {
      // Cập nhật state với dữ liệu từ server
      dispatch(
        updatePostLike({
          postId,
          isLiked: response.is_liked,
          likesCount: response.likes_count,
        })
      );
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: postService.deletePost,
    onMutate: (postId) => {
      // Lấy dữ liệu hiện tại từ cache
      const queryData = queryClient.getQueryData<{
        pages: { posts: Post[] }[];
      }>(["posts"]);
      const posts = queryData?.pages?.flatMap((page) => page.posts) || [];

      // Optimistic update cho cache
      queryClient.setQueryData<{ pages: { posts: Post[] }[] }>(
        ["posts"],
        (old) => {
          if (!old) return { pages: [] };
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.filter((post) => post.post_id !== postId),
            })),
          };
        }
      );

      // Optimistic update cho Redux store
      dispatch(removePost(postId));

      return { previousPosts: posts };
    },
    onError: (error, postId, context) => {
      console.log("error", error);
      // Rollback nếu có lỗi
      if (context?.previousPosts) {
        queryClient.setQueryData<{ pages: { posts: Post[] }[] }>(
          ["posts"],
          (old) => {
            if (!old) return { pages: [] };
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                posts: context.previousPosts.filter(
                  (post) => post.post_id === postId
                ),
              })),
            };
          }
        );
      }
      toast.error("Không thể xóa bài viết. Vui lòng thử lại!");
    },
    onSuccess: () => {
      toast.success("Xóa bài viết thành công!");
    },
  });
};

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => postService.getPost(postId),
    enabled: !!postId,
  });
};

export const usePostDetail = (postId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["postDetail", postId],
    queryFn: () => postService.getPost(postId),
    enabled: !!postId,
    initialData: () => {
      const queryData = queryClient.getQueryData<{
        pages: { posts: Post[] }[];
      }>(["posts"]);
      const post = queryData?.pages
        ?.flatMap((page) => page.posts)
        .find((post) => post.post_id === postId);

      return post;
    },
    staleTime: 1000 * 60,
  });
};

export const useAdminDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postService.adminDeletePost,
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Đã xóa bài viết");
    },
    onError: () => {
      toast.error("Không thể xóa bài viết. Vui lòng thử lại!");
    },
  });
};
