import { Box, Paper, Typography, styled } from "@mui/material";
import { Outlet, useLocation, Link } from "react-router-dom";
import { ThemeToggle } from "../../common/ThemeToggle/ThemeToggle";
import backgroundAuth from "../../../assets/images/background_auth.png";

const AuthWrapper = styled(Box)({
  width: "100vw",
  height: "100vh",
  display: "flex",
  overflow: "hidden",
});

const ImageSection = styled(Box)(({ theme }) => ({
  width: "50%",
  height: "100vh",
  position: "relative",
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const FormSection = styled(Box)(({ theme }) => ({
  width: "50%",
  height: "100vh",
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.down("md")]: {
    width: "100%",
  },
}));

const FormContent = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: 400,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
}));

const Footer = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: theme.spacing(2),
  color: theme.palette.text.secondary,
  fontSize: "0.875rem",
  "& a": {
    color: "inherit",
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
}));

export const AuthLayout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/auth/login";

  return (
    <AuthWrapper>
      <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
        <ThemeToggle />
      </Box>

      <ImageSection>
        <Box
          component="img"
          src={backgroundAuth}
          alt="Auth illustration"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </ImageSection>

      <FormSection>
        <FormContent>
          <Outlet />

          <Paper
            elevation={0}
            sx={{
              p: 2,
              width: "100%",
              textAlign: "center",
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="body2">
              {isLoginPage ? "Bạn chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
              <Link
                to={isLoginPage ? "/auth/register" : "/auth/login"}
                style={{
                  textDecoration: "none",
                  color: "#0095F6",
                  fontWeight: 600,
                }}
              >
                {isLoginPage ? "Đăng ký" : "Đăng nhập"}
              </Link>
            </Typography>
          </Paper>
        </FormContent>
      </FormSection>

      <Footer>
        <Typography component="a" href="#">
          Meta
        </Typography>
        <Typography component="a" href="#">
          Giới thiệu
        </Typography>
        <Typography component="a" href="#">
          Blog
        </Typography>
        <Typography component="a" href="#">
          Trợ giúp
        </Typography>
        <Typography component="a" href="#">
          API
        </Typography>
        <Typography component="a" href="#">
          Quyền riêng tư
        </Typography>
        <Typography component="a" href="#">
          Điều khoản
        </Typography>
        <Typography>© 2024 Instagram from Meta</Typography>
      </Footer>
    </AuthWrapper>
  );
};
