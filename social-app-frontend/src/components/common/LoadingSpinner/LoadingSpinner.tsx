import { CircularProgress, Box, styled } from "@mui/material";

const StyledBox = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(3),
  "& .MuiCircularProgress-root": {
    color: theme.palette.primary.main,
  },
}));

interface LoadingSpinnerProps {
  size?: number;
  fullPage?: boolean;
}

export const LoadingSpinner = ({
  size = 40,
  fullPage = false,
}: LoadingSpinnerProps) => {
  if (fullPage) {
    return (
      <StyledBox
        sx={{
          height: "100vh",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          backgroundColor: (theme) => theme.palette.background.default,
          zIndex: (theme) => theme.zIndex.modal + 1,
        }}
      >
        <CircularProgress size={size} />
      </StyledBox>
    );
  }

  return (
    <StyledBox>
      <CircularProgress size={size} />
    </StyledBox>
  );
};
