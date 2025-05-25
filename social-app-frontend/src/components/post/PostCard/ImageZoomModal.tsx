import { Box, styled } from "@mui/material";

const ModalOverlay = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.9)",
  zIndex: theme.zIndex.modal,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "zoom-out",
}));

const ZoomedImage = styled("img")({
  maxWidth: "90vw",
  maxHeight: "90vh",
  objectFit: "contain",
});

interface ImageZoomModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImageZoomModal = ({ imageUrl, onClose }: ImageZoomModalProps) => {
  return (
    <ModalOverlay onClick={onClose}>
      <ZoomedImage
        src={imageUrl}
        alt="Zoomed image"
        onClick={(e) => e.stopPropagation()}
      />
    </ModalOverlay>
  );
};
