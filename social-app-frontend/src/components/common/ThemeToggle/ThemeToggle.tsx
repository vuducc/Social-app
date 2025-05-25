import { IconButton, Tooltip } from "@mui/material";
import { LightMode, DarkMode } from "@mui/icons-material";
import { useTheme } from "../../../contexts/ThemeContext";

export const ThemeToggle = () => {
  const { mode, toggleTheme } = useTheme();

  return (
    <Tooltip title={`Chuyển sang chế độ ${mode === "light" ? "tối" : "sáng"}`}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "scale(1.1)",
          },
        }}
      >
        {mode === "light" ? <DarkMode /> : <LightMode />}
      </IconButton>
    </Tooltip>
  );
};
