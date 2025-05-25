import { Card, styled } from "@mui/material";
import { useState } from "react";
import { Post } from "../../../types/post.types";
import { useToggleLike } from "../../../hooks/usePost";
import { PostHeader } from "./PostHeader";
import { PostImages } from "./PostImages";
import { PostActions } from "./PostActions";
import { PostContent } from "./PostContent";
import { CommentDialog } from "../PostComments/CommentDialog";

const StyledCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 600,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "none",

  "& .swiper": {
    width: "100%",
    aspectRatio: "4/5",
    backgroundColor: "black",
  },
  // ... các styles khác
}));

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const { mutate: likePost } = useToggleLike();

  const handleLike = () => {
    likePost(post.post_id);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleOpenComments = () => {
    setIsCommentOpen(true);
  };

  const handleCloseComments = () => {
    setIsCommentOpen(false);
  };

  return (
    <>
      <StyledCard>
        <PostHeader
          username={post.user_username}
          profilePicture={post.user_profile_picture_url}
          createdAt={post.created_at}
          userId={post.user_id}
          postId={post.post_id}
        />

        <PostImages images={post.image_urls} />

        <PostActions
          isLiked={post.is_liked_by_me}
          isSaved={isSaved}
          onLike={handleLike}
          onSave={handleSave}
          onCommentClick={handleOpenComments}
        />

        <PostContent
          username={post.user_username}
          content={post.content}
          likesCount={post.likes_count}
          commentsCount={post.comments_count}
          postId={post.post_id}
        />
      </StyledCard>

      <CommentDialog
        open={isCommentOpen}
        onClose={handleCloseComments}
        post={post}
      />
    </>
  );
};
