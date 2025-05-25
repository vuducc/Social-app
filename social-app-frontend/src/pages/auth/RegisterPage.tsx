import { useState } from "react";
import { Box, Typography, Alert, AlertTitle, IconButton } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/common/Input/Input";
import { LoadingButton } from "../../components/common/Button/Button";
import { useAuth } from "../../contexts/AuthContext";
import {
  registerSchema,
  type RegisterFormData,
} from "../../schemas/auth.schema";
import toast from "react-hot-toast";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerAuth } = useAuth();
  const [error, setError] = useState<{
    title?: string;
    message: string;
    severity?: "error" | "warning" | "info";
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      const { confirmPassword, ...registerData } = data;
      const { email } = await registerAuth(registerData);
      toast.success("Vui lòng kiểm tra email để lấy mã OTP!", {
        icon: "📧",
      });
      navigate("/auth/verify-otp", { state: { email } });
    } catch (err: any) {
      console.error("Register error:", err);

      // Bắt lỗi detail từ response
      const errorDetail = err.response?.data?.detail;

      if (errorDetail) {
        switch (errorDetail) {
          case "Email already registered":
            toast.error("Email này đã được đăng ký");
            break;
          case "Username already taken":
            toast.error("Tên người dùng đã tồn tại");
            break;
          default:
            toast.error(errorDetail);
        }
      } else if (err.response?.status === 409) {
        toast.error("Email hoặc tên người dùng đã tồn tại");
      } else if (err.response?.status === 400) {
        toast.error(
          err.response.data.message || "Vui lòng kiểm tra lại thông tin"
        );
      } else if (!navigator.onLine) {
        toast.error("Vui lòng kiểm tra kết nối internet của bạn");
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại sau");
      }
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        gap: 2,
      }}
    >
      <Typography variant="h3" color="text.primary" align="center">
        Đăng ký
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        Đăng ký để xem ảnh và video từ bạn bè.
      </Typography>

      <Input
        customVariant="auth"
        placeholder="Email"
        type="email"
        error={!!errors.email}
        helperText={errors.email?.message}
        {...register("email")}
        fullWidth
        label="Email"
        autoComplete="new-email"
      />

      <Input
        customVariant="auth"
        placeholder="Tên người dùng"
        error={!!errors.username}
        helperText={errors.username?.message}
        {...register("username")}
        fullWidth
        label="Tên người dùng"
        autoComplete="off"
      />

      <Input
        customVariant="auth"
        type={showPassword ? "text" : "password"}  // Toggling password visibility
        placeholder="Mật khẩu"
        error={!!errors.password}
        helperText={errors.password?.message}
        {...register("password")}
        fullWidth
        label="Mật khẩu"
        autoComplete="new-password"
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

      <Input
        customVariant="auth"
        type={showConfirmPassword ? "text" : "password"}  // Toggling confirm password visibility
        placeholder="Nhập lại mật khẩu"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        {...register("confirmPassword")}
        fullWidth
        label="Nhập lại mật khẩu"
        autoComplete="new-password"
        InputProps={{
          endAdornment: (
            <IconButton
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              edge="end"
            >
              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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

      <Typography variant="caption" color="text.secondary" align="center">
        Bằng cách đăng ký, bạn đồng ý với{" "}
        <Typography
          component="a"
          variant="caption"
          href="#"
          color="text.secondary"
          sx={{ textDecoration: "none", fontWeight: 600 }}
        >
          Điều khoản
        </Typography>
        ,{" và "}
        <Typography
          component="a"
          variant="caption"
          href="#"
          color="text.secondary"
          sx={{ textDecoration: "none", fontWeight: 600 }}
        >
          Chính sách quyền riêng tư
        </Typography>{" "}
      </Typography>

      <LoadingButton
        type="submit"
        variant="primary"
        fullWidth
        loading={isSubmitting}
      >
        Đăng ký
      </LoadingButton>
    </Box>
  );
};
