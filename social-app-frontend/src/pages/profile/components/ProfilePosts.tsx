import { Box } from "@mui/material";
import { useUserPosts } from "../../../hooks/usePost";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner/LoadingSpinner";
import { PostGrid } from "../../../components/common/PostGrid/PostGrid";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

interface ProfilePostsProps {
  userId: string;
}

export const ProfilePosts = ({ userId }: ProfilePostsProps) => {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "300px",
  });

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useUserPosts(userId);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <LoadingSpinner />;

  const posts = data?.pages.flatMap(page => page.posts) || [];

  if (!posts.length) {
    return <Box sx={{ textAlign: "center", py: 4 }}>Chưa có bài viết nào</Box>;
  }

  return (
    <Box>
      <PostGrid posts={posts} />
      {(hasNextPage || isFetchingNextPage) && (
        <Box ref={ref} sx={{ textAlign: 'center', py: 2 }}>
          <LoadingSpinner size={30} />
        </Box>
      )}
    </Box>
  );
};
