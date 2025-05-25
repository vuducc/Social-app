import { Box, Typography, styled, TextField, Alert } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useState } from "react";
import { useChangePassword } from "../../hooks/useUser";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const FormSection = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    gap: theme.spacing(1),
  },
}));

const Label = styled(Typography)(({ theme }) => ({
  width: 150,
  textAlign: "right",
  fontWeight: 600,
  [theme.breakpoints.down("sm")]: {
    width: "auto",
    textAlign: "left",
  },
}));

const InputContainer = styled(Box)({
  flex: 1,
  maxWidth: 400,
});

const StyledTextField = styled(TextField)({
  width: "100%",
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z
    .string()
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
    .max(50, "Mật khẩu không được quá 50 ký tự"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export const ChangePasswordPage = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const { mutate: changePassword, isPending } = useChangePassword();

  const onSubmit = (data: PasswordFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    changePassword(
      {
        old_password: data.currentPassword,
        new_password: data.newPassword,
      },
      {
        onSuccess: () => {
          setSuccessMessage("Đổi mật khẩu thành công");
          reset(); // Reset form sau khi thành công
        },
        onError: (error: Error) => {
          setErrorMessage(error.message);
        },
      }
    );
  };

  return (
    <PageContainer>
      <form onSubmit={handleSubmit(onSubmit)}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <FormSection>
          <Label>Mật khẩu hiện tại</Label>
          <InputContainer>
            <StyledTextField
              type="password"
              {...register("currentPassword")}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword?.message}
              disabled={isPending}
              size="small"
            />
          </InputContainer>
        </FormSection>

        <FormSection>
          <Label>Mật khẩu mới</Label>
          <InputContainer>
            <StyledTextField
              type="password"
              {...register("newPassword")}
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              disabled={isPending}
              size="small"
            />
          </InputContainer>
        </FormSection>

        <FormSection>
          <Label>Xác nhận mật khẩu mới</Label>
          <InputContainer>
            <StyledTextField
              type="password"
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              disabled={isPending}
              size="small"
            />
          </InputContainer>
        </FormSection>

        <FormSection>
          <Label />
          <InputContainer>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isPending}
            >
              Đổi mật khẩu
            </LoadingButton>
          </InputContainer>
        </FormSection>
      </form>
    </PageContainer>
  );
};
