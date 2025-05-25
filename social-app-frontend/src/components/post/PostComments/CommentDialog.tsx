import { styled } from "@mui/material/styles";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Post } from "../../../types/post.types";
import { useState } from "react";
import { ImageSection } from "./ImageSection";
import { CommentSection } from "./CommentSection";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    maxWidth: "1380px",
    maxHeight: "90vh",
    margin: theme.spacing(2),
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: theme.palette.background.paper,
  },
}));

const StyledDialogContent = styled(DialogContent)({
  display: "flex",
  padding: 0,
  height: "90vh",
});

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: 8,
  top: 8,
  zIndex: 2,
  color: theme.palette.common.white,
}));

interface CommentDialogProps {
  open: boolean;
  onClose: () => void;
  post: Post;
}

export const CommentDialog = ({ open, onClose, post }: CommentDialogProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <CloseButton onClick={onClose}>
        <CloseIcon />
      </CloseButton>

      <StyledDialogContent>
        <ImageSection
          images={post.image_urls}
          currentIndex={currentImageIndex}
          onIndexChange={setCurrentImageIndex}
        />
        <CommentSection post={post} />
      </StyledDialogContent>
    </StyledDialog>
  );
};
