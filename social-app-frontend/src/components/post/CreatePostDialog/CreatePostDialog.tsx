import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  styled,
} from "@mui/material";
import {
  Close as CloseIcon,
  AddPhotoAlternate,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useState, useRef } from "react";
import { useCreatePost } from "../../../hooks/usePost";

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  position: "relative",
  aspectRatio: "1",
  borderRadius: theme.spacing(1),
  overflow: "hidden",
  "&:hover .delete-button": {
    opacity: 1,
  },
}));

const PreviewImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const DeleteButton = styled(IconButton)(() => ({
  position: "absolute",
  top: 4,
  right: 4,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  color: "white",
  padding: 4,
  opacity: 0,
  transition: "opacity 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
}));

const UploadButton = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(3),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(0, 0, 0, 0.04)",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.06)",
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    width: "100%",
    maxWidth: 600,
    borderRadius: theme.spacing(2),
  },
}));

interface CreatePostDialogProps {
  open: boolean;
  onClose: () => void;
}

export const CreatePostDialog = ({ open, onClose }: CreatePostDialogProps) => {
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: createPost } = useCreatePost();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles = files.filter((file) => file.type.startsWith("image/"));

    if (newFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newFiles]);

      // Tạo preview URLs cho các file mới
      newFiles.forEach((file) => {
        const url = URL.createObjectURL(file);
        setPreviewUrls((prev) => [...prev, url]);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedFiles.length === 0) {
      return;
    }

    // Lưu lại data để tạo post
    const postData = {
      content,
      files: selectedFiles,
    };

    // Reset form và đóng dialog ngay lập tức
    setContent("");
    setSelectedFiles([]);
    setPreviewUrls([]);
    onClose();

    // Tạo post trong background
    createPost(postData);
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" component="div">
          Tạo bài viết mới
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Bạn đang nghĩ gì?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />

        {previewUrls.length > 0 && (
          <ImagePreviewContainer>
            {previewUrls.map((url, index) => (
              <ImagePreview key={url}>
                <PreviewImage src={url} alt={`Preview ${index + 1}`} />
                <DeleteButton
                  className="delete-button"
                  size="small"
                  onClick={() => handleRemoveImage(index)}
                >
                  <DeleteIcon fontSize="small" />
                </DeleteButton>
              </ImagePreview>
            ))}
          </ImagePreviewContainer>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*"
          style={{ display: "none" }}
        />

        <UploadButton
          onClick={() => fileInputRef.current?.click()}
          sx={{ mt: previewUrls.length > 0 ? 2 : 0 }}
        >
          <AddPhotoAlternate
            sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
          />
          <Typography color="text.secondary">Thêm ảnh</Typography>
        </UploadButton>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!content.trim() && selectedFiles.length === 0}
        >
          Đăng
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};
