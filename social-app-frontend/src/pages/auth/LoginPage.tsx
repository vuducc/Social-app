import { useState } from "react";
import { Box, Typography, useTheme, Alert, AlertTitle, IconButton } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../../components/common/Input/Input";
import { LoadingButton } from "../../components/common/Button/Button";
import { useAuth } from "../../contexts/AuthContext";
import { loginSchema, type LoginFormData } from "../../schemas/auth.schema";
import toast from "react-hot-toast";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<{
    title?: string;
    message: string;
    severity?: "error" | "warning" | "info";
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data.email, data.password);
      toast.success("Đăng nhập thành công!");
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.response?.status === 401) {
        toast.error("Email hoặc mật khẩu không chính xác");
      } else if (err.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng thử lại sau vài phút", {
          duration: 5000,
        });
      } else if (!navigator.onLine) {
        toast.error("Vui lòng kiểm tra kết nối internet của bạn");
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại sau");
      }
      reset({ ...data, password: "" });
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        gap: 2,
      }}
    >
      <Typography variant="h3" color="text.primary">
        Đăng nhập
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Đăng nhập để xem ảnh và video từ bạn bè.
      </Typography>

      <Input
        customVariant="auth"
        placeholder="Email hoặc tên người dùng"
        error={!!errors.email}
        helperText={errors.email?.message}
        {...register("email")}
        fullWidth
        label="Email"
      />

      <Input
        customVariant="auth"
        type={showPassword ? "text" : "password"} // Toggle between text and password for visibility
        placeholder="Mật khẩu"
        error={!!errors.password}
        helperText={errors.password?.message}
        {...register("password")}
        fullWidth
        label="Mật khẩu"
        InputProps={{
          endAdornment: (
            <IconButton
              onClick={() => setShowPassword((prev) => !prev)} 
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />} 
            </IconButton>
          ),
        }}
      />

      {error && (
        <Alert
          severity={error.severity || "error"}
          sx={{
            borderRadius: 1,
            "& .MuiAlert-message": {
              width: "100%",
            },
          }}
        >
          {error.title && <AlertTitle>{error.title}</AlertTitle>}
          {error.message}
        </Alert>
      )}

      <LoadingButton
        type="submit"
        variant="primary"
        fullWidth
        loading={isSubmitting}
      >
        Đăng nhập
      </LoadingButton>

      <Typography
        variant="body2"
        color="primary"
        align="center"
        sx={{
          cursor: "pointer",
          "&:hover": {
            textDecoration: "underline",
            color: theme.palette.primary.dark,
          },
        }}
      >
        Quên mật khẩu?
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Khi tạo tài khoản, bạn đã đồng ý với{" "}
        <Link to="/terms" style={{ textDecoration: "underline" }}>
          điều khoản dịch vụ
        </Link>{" "}
        và{" "}
        <Link to="/privacy" style={{ textDecoration: "underline" }}>
          chính sách bảo mật
        </Link>
        .
      </Typography>
    </Box>
  );
};
