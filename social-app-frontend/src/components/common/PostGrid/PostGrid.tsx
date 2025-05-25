import { ImageList, ImageListItem, Box, styled } from "@mui/material";
import { FavoriteOutlined, ChatBubbleOutline } from "@mui/icons-material";
import { useState } from "react";
import { Post } from "../../../types/post.types";
import { CommentDialog } from "../../post/PostComments/CommentDialog";
import { usePost } from "../../../hooks/usePost";

const StyledImageList = styled(ImageList)(({ theme }) => ({
  gridTemplateColumns: "repeat(3, 1fr) !important",
  gap: "24px !important",
  [theme.breakpoints.down("sm")]: {
    gap: "3px !important",
  },
}));

const PostItem = styled(ImageListItem)(({ theme }) => ({
  aspectRatio: "1",
  cursor: "pointer",
  position: "relative",
  "&:hover .overlay": {
    opacity: 1,
  },
  [theme.breakpoints.down("sm")]: {
    width: "calc(33.333% - 2px)",
  },
}));

const PostOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(4),
  opacity: 0,
  transition: "opacity 0.2s ease",
  color: "white",
  "& .stat": {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    fontWeight: 600,
    [theme.breakpoints.down("sm")]: {
      "& .count": {
        display: "none",
      },
    },
  },
}));

interface PostGridProps {
  posts: Post[];
}

export const PostGrid = ({ posts }: PostGridProps) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const { data: selectedPost, isLoading } = usePost(selectedPostId || "");

  const handleClose = () => {
    setSelectedPostId(null);
  };

  return (
    <>
      <StyledImageList cols={3} gap={28}>
        {posts.map((post) => (
          <PostItem
            key={post.post_id}
            onClick={() => setSelectedPostId(post.post_id)}
          >
            <img
              src={post.image_urls[0]}
              alt=""
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <PostOverlay className="overlay">
              <Box className="stat">
                <FavoriteOutlined />
                <span className="count">{post.likes_count}</span>
              </Box>
              <Box className="stat">
                <ChatBubbleOutline />
                <span className="count">{post.comments_count}</span>
              </Box>
            </PostOverlay>
          </PostItem>
        ))}
      </StyledImageList>

      {selectedPostId && selectedPost && !isLoading && (
        <CommentDialog open={true} onClose={handleClose} post={selectedPost} />
      )}
    </>
  );
};
