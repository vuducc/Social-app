import {
  Dialog,
  DialogContent,
  IconButton,
  styled,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { usePost } from "../../../hooks/usePost";
import { LoadingSpinner } from "../../common/LoadingSpinner/LoadingSpinner";
import { CommentDialog } from "../PostComments/CommentDialog";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    maxWidth: "none",
    maxHeight: "none",
    height: "100%",
    [theme.breakpoints.up("md")]: {
      height: "90vh",
      width: "90vw",
      maxWidth: 1200,
    },
  },
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: theme.spacing(2),
  top: theme.spacing(2),
  color: "white",
  zIndex: 1,
}));

interface PostModalProps {
  postId: string;
  onClose: () => void;
}

export const PostModal = ({ postId, onClose }: PostModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { data: post, isLoading } = usePost(postId);

  if (isLoading) return <LoadingSpinner />;
  if (!post) return null;

  return (
    <StyledDialog open={true} onClose={onClose} fullScreen={isMobile}>
      <CloseButton onClick={onClose}>
        <Close />
      </CloseButton>
      <DialogContent sx={{ p: 0 }}>
        <CommentDialog open={true} onClose={onClose} post={post} />
      </DialogContent>
    </StyledDialog>
  );
};
