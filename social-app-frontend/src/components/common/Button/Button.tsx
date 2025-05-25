import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  styled,
} from "@mui/material";
import MuiLoadingButton, {
  LoadingButtonProps as MuiLoadingButtonProps,
} from "@mui/lab/LoadingButton";

// Tạo type riêng cho variant custom
type CustomVariant = "primary" | "secondary" | "outline" | "text";

// Tạo interface mới kế thừa từ MuiButtonProps
interface CustomButtonProps extends Omit<MuiButtonProps, "variant"> {
  variant?: CustomVariant;
  fullWidth?: boolean;
}

// Cập nhật interface cho styled components
interface StyledButtonProps {
  customvariant?: CustomVariant;
  fullWidth?: boolean;
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) =>
    !["customvariant", "fullWidth"].includes(String(prop)),
})<StyledButtonProps>(({ theme, customvariant = "primary", fullWidth }) => ({
  textTransform: "none",
  fontWeight: 600,
  padding: "8px 20px",
  borderRadius: theme.shape.borderRadius,
  fontSize: "0.875rem",
  width: fullWidth ? "100%" : "auto",
  transition: "all 0.2s ease",

  ...(customvariant === "primary" && {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
      transform: "translateY(-1px)",
    },
  }),

  ...(customvariant === "secondary" && {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    "&:hover": {
      backgroundColor: theme.palette.background.default,
    },
  }),

  ...(customvariant === "outline" && {
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  }),

  ...(customvariant === "text" && {
    color: theme.palette.primary.main,
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: "transparent",
      color: theme.palette.primary.dark,
    },
  }),
}));

// Custom Loading Button Props
interface CustomLoadingButtonProps
  extends Omit<MuiLoadingButtonProps, "variant"> {
  variant?: CustomVariant;
}

// Styled Loading Button
const StyledLoadingButton = styled(MuiLoadingButton, {
  shouldForwardProp: (prop) => !["customvariant"].includes(String(prop)),
})<{ customvariant?: CustomVariant }>(
  ({ theme, customvariant = "primary" }) => ({
    textTransform: "none",
    fontWeight: 600,
    borderRadius: theme.shape.borderRadius,

    ...(customvariant === "primary" && {
      backgroundColor: theme.palette.primary.main,
      color: "#fff",
      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
      },
    }),

    ...(customvariant === "secondary" && {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      border: `1px solid ${theme.palette.divider}`,
    }),

    ...(customvariant === "outline" && {
      border: `1px solid ${theme.palette.divider}`,
      color: theme.palette.text.primary,
      backgroundColor: "transparent",
    }),

    ...(customvariant === "text" && {
      color: theme.palette.primary.main,
      backgroundColor: "transparent",
    }),
  })
);

// Export các components
export const Button = ({ children, variant, ...props }: CustomButtonProps) => {
  // Chuyển đổi custom variant sang MUI variant
  let muiVariant: MuiButtonProps["variant"] = "contained";

  switch (variant) {
    case "primary":
      muiVariant = "contained";
      break;
    case "secondary":
    case "outline":
      muiVariant = "outlined";
      break;
    case "text":
      muiVariant = "text";
      break;
  }

  return (
    <StyledButton {...props} variant={muiVariant} customvariant={variant}>
      {children}
    </StyledButton>
  );
};

export const LoadingButton = ({
  children,
  variant,
  ...props
}: CustomLoadingButtonProps) => {
  // Chuyển đổi custom variant sang MUI variant
  let muiVariant: MuiLoadingButtonProps["variant"] = "contained";

  switch (variant) {
    case "primary":
      muiVariant = "contained";
      break;
    case "secondary":
    case "outline":
      muiVariant = "outlined";
      break;
    case "text":
      muiVariant = "text";
      break;
  }

  return (
    <StyledLoadingButton
      {...props}
      variant={muiVariant}
      customvariant={variant}
    >
      {children}
    </StyledLoadingButton>
  );
};
