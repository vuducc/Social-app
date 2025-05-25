import { styled } from "@mui/material/styles";
import { Box, IconButton } from "@mui/material";
import {
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
} from "@mui/icons-material";
import { useState } from "react";

const ImageContainer = styled(Box)({
  width: "100%",
  aspectRatio: "4/5",
  position: "relative",
  backgroundColor: "#000",
  overflow: "hidden",
});

const ImageSlider = styled(Box)({
  width: "100%",
  height: "100%",
  display: "flex",
  transition: "transform 0.3s ease",
});

const ImageWrapper = styled(Box)({
  width: "100%",
  flexShrink: 0,
  height: "100%",
});

const PostImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const NavigationButton = styled(IconButton)(() => ({
  position: "absolute",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
  width: 32,
  height: 32,
  zIndex: 2,
}));

const DotContainer = styled(Box)({
  position: "absolute",
  bottom: 16,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: 8,
  zIndex: 1,
});

interface PostImagesProps {
  images: string[];
}

export const PostImages = ({ images }: PostImagesProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <ImageContainer>
      <ImageSlider sx={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {images.map((url, index) => (
          <ImageWrapper key={index}>
            <PostImage
              src={url}
              alt={`Post image ${index + 1}`}
              onError={(e: any) => {
                e.target.onerror = null;
                e.target.src = "/images/placeholder.png";
              }}
              loading="lazy"
            />
          </ImageWrapper>
        ))}
      </ImageSlider>

      {images.length > 1 && (
        <>
          <NavigationButton
            sx={{ left: 16, top: "50%", transform: "translateY(-50%)" }}
            onClick={handlePrev}
          >
            <PrevIcon sx={{ fontSize: 20 }} />
          </NavigationButton>

          <NavigationButton
            sx={{ right: 16, top: "50%", transform: "translateY(-50%)" }}
            onClick={handleNext}
          >
            <NextIcon sx={{ fontSize: 20 }} />
          </NavigationButton>

          <DotContainer>
            {images.map((_, index) => (
              <Box
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor:
                    index === currentIndex
                      ? "white"
                      : "rgba(255, 255, 255, 0.5)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
              />
            ))}
          </DotContainer>
        </>
      )}
    </ImageContainer>
  );
};
