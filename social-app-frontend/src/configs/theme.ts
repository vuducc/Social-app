import { createTheme, PaletteMode, alpha } from "@mui/material/styles";

const lightPalette = {
  primary: {
    main: "#0095F6",
    light: "#1EA1F7",
    dark: "#0074CC",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#262626",
    light: "#363636",
    dark: "#1A1A1A",
    contrastText: "#FFFFFF",
  },
  error: {
    main: "#ED4956",
    light: "#EF5E6B",
    dark: "#CC3E48",
  },
  warning: {
    main: "#FFA000",
    light: "#FFB333",
    dark: "#CC8000",
  },
  success: {
    main: "#2ECC71",
    light: "#58D68D",
    dark: "#27AE60",
  },
  neutral: {
    main: "#8E8E8E",
    light: "#C7C7C7",
    dark: "#6E6E6E",
  },
  background: {
    default: "#FAFAFA",
    paper: "#FFFFFF",
  },
  text: {
    primary: "#262626",
    secondary: "#8E8E8E",
  },
  divider: "#DBDBDB",
  action: {
    active: "#262626",
    hover: "rgba(0, 0, 0, 0.04)",
    selected: "rgba(0, 0, 0, 0.08)",
    disabled: "rgba(0, 0, 0, 0.26)",
    disabledBackground: "rgba(0, 0, 0, 0.12)",
  },
};

const darkPalette = {
  primary: {
    main: "#0095F6",
    light: "#1EA1F7",
    dark: "#0074CC",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#FAFAFA",
    light: "#FFFFFF",
    dark: "#DBDBDB",
    contrastText: "#000000",
  },
  error: {
    main: "#ED4956",
    light: "#EF5E6B",
    dark: "#CC3E48",
  },
  warning: {
    main: "#FFA000",
    light: "#FFB333",
    dark: "#CC8000",
  },
  success: {
    main: "#2ECC71",
    light: "#58D68D",
    dark: "#27AE60",
  },
  neutral: {
    main: "#8E8E8E",
    light: "#363636",
    dark: "#6E6E6E",
  },
  background: {
    default: "#121212",
    paper: "#1A1A1A",
  },
  text: {
    primary: "#FAFAFA",
    secondary: "#8E8E8E",
  },
  divider: "#363636",
  action: {
    active: "#FFFFFF",
    hover: "rgba(255, 255, 255, 0.08)",
    selected: "rgba(255, 255, 255, 0.16)",
    disabled: "rgba(255, 255, 255, 0.3)",
    disabledBackground: "rgba(255, 255, 255, 0.12)",
  },
};

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === "light" ? lightPalette : darkPalette),
    },
    typography: {
      fontFamily: [
        "Poppins",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "Arial",
        "sans-serif",
      ].join(","),
      h1: {
        fontSize: "2.5rem",
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "-0.01em",
      },
      h2: {
        fontSize: "2rem",
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: "-0.005em",
      },
      h3: {
        fontSize: "1.75rem",
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: "1.5rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: "1.25rem",
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: "1rem",
        fontWeight: 500,
        lineHeight: 1.4,
      },
      subtitle1: {
        fontSize: "1rem",
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: "0.00938em",
      },
      subtitle2: {
        fontSize: "0.875rem",
        fontWeight: 500,
        lineHeight: 1.57,
        letterSpacing: "0.00714em",
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.5,
        letterSpacing: "0.00938em",
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.43,
        letterSpacing: "0.01071em",
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
        letterSpacing: "0.02857em",
      },
      caption: {
        fontSize: "0.75rem",
        lineHeight: 1.66,
        letterSpacing: "0.03333em",
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: "0.875rem",
            transition: theme.transitions.create(
              ["background-color", "box-shadow", "border-color", "color"],
              { duration: 200 }
            ),
          }),
          contained: ({ theme }) => ({
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
              backgroundColor: alpha(theme.palette.primary.main, 0.9),
            },
          }),
          outlined: ({ theme }) => ({
            borderWidth: "1.5px",
            "&:hover": {
              borderWidth: "1.5px",
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
          }),
          text: ({ theme }) => ({
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
          }),
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
          size: "small",
        },
        styleOverrides: {
          root: ({ theme }) => ({
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
              backgroundColor: mode === "light" ? "#F5F5F5" : "#262626",
              transition: theme.transitions.create([
                "border-color",
                "box-shadow",
              ]),
              "&:hover": {
                backgroundColor: mode === "light" ? "#EEEEEE" : "#363636",
              },
              "&.Mui-focused": {
                backgroundColor: mode === "light" ? "#FFFFFF" : "#1A1A1A",
                boxShadow: `0 0 0 2px ${alpha(
                  theme.palette.primary.main,
                  0.2
                )}`,
              },
            },
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 12,
            border: "1px solid",
            borderColor: mode === "light" ? "#DBDBDB" : "#363636",
            transition: theme.transitions.create([
              "border-color",
              "box-shadow",
            ]),
            "&:hover": {
              borderColor: mode === "light" ? "#B3B3B3" : "#4A4A4A",
            },
          }),
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            boxShadow:
              mode === "light"
                ? "0px 8px 24px rgba(0, 0, 0, 0.12)"
                : "0px 8px 24px rgba(0, 0, 0, 0.4)",
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            border: `2px solid ${mode === "light" ? "#FFFFFF" : "#1A1A1A"}`,
            boxShadow: `0 0 0 1px ${mode === "light" ? "#DBDBDB" : "#363636"}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 8,
            transition: theme.transitions.create([
              "background-color",
              "box-shadow",
            ]),
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
          }),
          filled: {
            backgroundColor: mode === "light" ? "#F5F5F5" : "#262626",
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 6,
            backgroundColor: mode === "light" ? "#262626" : "#F5F5F5",
            color: mode === "light" ? "#FFFFFF" : "#262626",
            fontSize: "0.75rem",
            padding: "6px 12px",
          },
          arrow: {
            color: mode === "light" ? "#262626" : "#F5F5F5",
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: "12px 16px",
          },
          standardSuccess: {
            backgroundColor: alpha("#2ECC71", 0.1),
            color: "#2ECC71",
          },
          standardError: {
            backgroundColor: alpha("#ED4956", 0.1),
            color: "#ED4956",
          },
          standardWarning: {
            backgroundColor: alpha("#FFA000", 0.1),
            color: "#FFA000",
          },
          standardInfo: {
            backgroundColor: alpha("#0095F6", 0.1),
            color: "#0095F6",
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            backgroundColor: mode === "light" ? "#F5F5F5" : "#262626",
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: mode === "light" ? "#DBDBDB" : "#363636",
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 8,
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
            "&.Mui-selected": {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
              },
            },
          }),
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            padding: 8,
          },
          track: {
            borderRadius: 22 / 2,
          },
          thumb: {
            boxShadow: "none",
          },
        },
      },
    },
  });
