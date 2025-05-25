import { CardActions, IconButton, Box } from "@mui/material";
import {
  FavoriteBorder,
  Favorite,
  ChatBubbleOutline,
  SendOutlined,
  BookmarkBorder,
  Bookmark,
} from "@mui/icons-material";

interface PostActionsProps {
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onSave: () => void;
  onCommentClick: () => void;
}

export const PostActions = ({
  isLiked,
  isSaved,
  onLike,
  onSave,
  onCommentClick,
}: PostActionsProps) => {
  return (
    <CardActions disableSpacing>
      <Box>
        <IconButton onClick={onLike}>
          {isLiked ? (
            <Favorite sx={{ color: "error.main" }} />
          ) : (
            <FavoriteBorder />
          )}
        </IconButton>
        <IconButton onClick={onCommentClick}>
          <ChatBubbleOutline />
        </IconButton>
        <IconButton>
          <SendOutlined />
        </IconButton>
      </Box>
      <IconButton sx={{ marginLeft: "auto" }} onClick={onSave}>
        {isSaved ? <Bookmark /> : <BookmarkBorder />}
      </IconButton>
    </CardActions>
  );
};
