import { Box, CircularProgress, Typography, styled } from "@mui/material";
import { PostCard } from "../../components/post/PostCard/PostCard";
import { RightBar } from "../../components/layout/RightBar/RightBar";
import { usePosts } from "../../hooks/usePost";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

const HomeContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(4),
  position: "relative",
  maxWidth: 1200,
  margin: "0 auto",
  padding: theme.spacing(0, 2),
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    padding: theme.spacing(0, 1),
  },
}));

const PostsContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  maxWidth: 600,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
  margin: "0 auto",
  width: "100%",
  [theme.breakpoints.down("md")]: {
    maxWidth: "100%",
  },
}));

const RightBarContainer = styled(Box)(({ theme }) => ({
  width: 350,
  position: "sticky",
  top: theme.spacing(2),
  height: "fit-content",
  marginRight: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const LoadingContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  padding: "20px 0",
});

export const HomePage = () => {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  const { data, isLoading, isFetching, hasNextPage, fetchNextPage } = usePosts();

  useEffect(() => {
    if (inView && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetching, fetchNextPage]);

  if (isLoading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  return (
    <HomeContainer>
      <PostsContainer>
        {posts.length ? (
          posts.map((post) => (
            <PostCard key={post.post_id} post={post} />
          ))
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Chưa có bài viết nào.
            </Typography>
          </Box>
        )}

        {(hasNextPage || isFetching) && (
          <LoadingContainer ref={ref}>
            <CircularProgress size={30} />
          </LoadingContainer>
        )}
      </PostsContainer>

      <RightBarContainer>
        <RightBar />
      </RightBarContainer>
    </HomeContainer>
  );
};