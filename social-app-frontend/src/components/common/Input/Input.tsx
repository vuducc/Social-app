import { forwardRef } from "react";
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  styled,
  alpha,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

// Tạo type riêng cho variant custom
type CustomVariant = "search" | "standard" | "auth";

// Tạo interface mới kế thừa từ TextFieldProps
interface CustomInputProps extends Omit<TextFieldProps, "variant"> {
  customVariant?: CustomVariant;
}

const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => !["customVariant"].includes(String(prop)),
})<CustomInputProps>(({ theme, customVariant = "standard" }) => ({
  width: "100%",

  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius,
    backgroundColor:
      theme.palette.mode === "light"
        ? alpha(theme.palette.common.black, 0.04)
        : alpha(theme.palette.common.white, 0.04),
    fontSize: "0.875rem",
    transition: "all 0.2s ease",

    ...(customVariant === "search" && {
      backgroundColor:
        theme.palette.mode === "light"
          ? alpha(theme.palette.common.black, 0.06)
          : alpha(theme.palette.common.white, 0.06),
      "& fieldset": { border: "none" },
      "&:hover": {
        backgroundColor:
          theme.palette.mode === "light"
            ? alpha(theme.palette.common.black, 0.08)
            : alpha(theme.palette.common.white, 0.08),
      },
    }),

    ...(customVariant === "auth" && {
      backgroundColor: theme.palette.background.paper,
      "& fieldset": {
        borderColor: theme.palette.divider,
      },
    }),

    "& fieldset": {
      borderColor: theme.palette.divider,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.mode === "light" ? "#A8A8A8" : "#666666",
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },

  "& .MuiInputLabel-root": {
    fontSize: "0.875rem",
    "&.Mui-focused": {
      color: theme.palette.text.primary,
    },
  },

  "& .MuiInputBase-input": {
    padding: customVariant === "search" ? "8px 12px" : "12px 14px",
    "&::placeholder": {
      color: theme.palette.text.secondary,
      opacity: 1,
    },
  },
}));

export const Input = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ customVariant = "standard", ...props }, ref) => {
    if (customVariant === "search") {
      return (
        <StyledTextField
          variant="outlined"
          placeholder="Tìm kiếm"
          inputRef={ref}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{
                      color: "text.secondary",
                      fontSize: "1.25rem",
                    }}
                  />
                </InputAdornment>
              ),
            },
          }}
          customVariant={customVariant}
          {...props}
        />
      );
    }

    return (
      <StyledTextField
        variant="outlined"
        inputRef={ref}
        customVariant={customVariant}
        {...props}
      />
    );
  }
);

// Thêm displayName cho component (tùy chọn nhưng recommended)
Input.displayName = "Input";
