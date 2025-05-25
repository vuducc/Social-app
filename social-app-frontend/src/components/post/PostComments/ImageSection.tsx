import { styled } from "@mui/material/styles";
import { Box, IconButton } from "@mui/material";
import {
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
} from "@mui/icons-material";

const ImageContainer = styled(Box)({
  flex: "0 0 65%",
  backgroundColor: "#000",
  display: "flex",
  alignItems: "center",
  position: "relative",
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
  height: "100%",
  flexShrink: 0,
  position: "relative",
});

const StyledImage = styled("img")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "contain",
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

interface ImageSectionProps {
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export const ImageSection = ({
  images,
  currentIndex,
  onIndexChange,
}: ImageSectionProps) => {
  const handleNext = () => {
    onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const handlePrev = () => {
    onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  return (
    <ImageContainer>
      <ImageSlider sx={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {images.map((url, index) => (
          <ImageWrapper key={index}>
            <StyledImage src={url} alt={`Post image ${index + 1}`} />
          </ImageWrapper>
        ))}
      </ImageSlider>

      {images.length > 1 && (
        <>
          <NavigationButton sx={{ left: 16 }} onClick={handlePrev}>
            <PrevIcon sx={{ fontSize: 20 }} />
          </NavigationButton>

          <NavigationButton sx={{ right: 16 }} onClick={handleNext}>
            <NextIcon sx={{ fontSize: 20 }} />
          </NavigationButton>

          <DotContainer>
            {images.map((_, index) => (
              <Box
                key={index}
                onClick={() => onIndexChange(index)}
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
