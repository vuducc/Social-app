import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { OTPInput } from "../../components/common/Input/OTPinput";

export const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP } = useAuth();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Xử lý khi OTP thay đổi
  const handleOtpChange = async (value: string) => {
    setOtp(value);
    console.log(isSubmitting);

    // Tự động submit khi đủ 6 số
    if (value.length === 6) {
      setIsSubmitting(true);
      toast.loading("Mã OTP đang xác thực...");

      try {
        await verifyOTP({ otp: value, email });
        toast.success("Xác thực thành công!");
        navigate("/");
      } catch (err: any) {
        console.error("OTP verification error:", err);
        if (err.response?.status === 400) {
        toast.error("Mã OTP không chính xác, vui lòng nhập lại từ đầu.");
          setOtp(""); // Reset OTP input
        } else {
          toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!email) {
    navigate("/login");
    return null;
  }

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        gap: 2,
      }}
    >
      <Typography variant="h3" color="text.primary">
        Xác thực email
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Vui lòng nhập mã OTP đã được gửi đến email {email}
      </Typography>

      <Box sx={{ width: "100%", mt: 2 }}>
        <OTPInput value={otp} onChange={handleOtpChange} />
      </Box>
    </Box>
  );
};
