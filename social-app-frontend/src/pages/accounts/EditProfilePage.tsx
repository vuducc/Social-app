import {
  Box,
  Typography,
  styled,
  Avatar,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import { useAppSelector } from "../../hooks/useRedux";
import { useUpdateProfile, useUpdateAvatar } from "../../hooks/useUser";
import { useState, useRef } from "react";
import { LoadingButton } from "@mui/lab";

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const AvatarSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(3),
  marginBottom: theme.spacing(4),
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

export const EditProfilePage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    username: user?.username || "",
    full_name: user?.full_name || "",
    email: user?.email || "",
    bio: user?.bio || "",
  });

  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: updateAvatar, isPending: isUpdatingAvatar } =
    useUpdateAvatar();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateAvatar(file);
    }
  };

  const isLoading = isUpdating || isUpdatingAvatar;

  return (
    <PageContainer>
      <form onSubmit={handleSubmit}>
        <AvatarSection>
          <Box sx={{ width: 150, textAlign: "right" }}>
            <Avatar
              src={user?.profile_picture_url || undefined}
              sx={{ width: 56, height: 56, ml: "auto" }}
            />
          </Box>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {user?.username}
            </Typography>
            <Button
              variant="text"
              color="primary"
              onClick={handleAvatarClick}
              disabled={isLoading}
            >
              Thay đổi ảnh đại diện
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Box>
        </AvatarSection>

        <FormSection>
          <Label>Tên người dùng</Label>
          <InputContainer>
            <StyledTextField
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              size="small"
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Trong hầu hết các trường hợp, bạn sẽ có thể đổi lại tên người dùng
              về
              {user?.username} trong vòng 14 ngày nữa.
            </Typography>
          </InputContainer>
        </FormSection>

        <FormSection>
          <Label>Tên đầy đủ</Label>
          <InputContainer>
            <StyledTextField
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              disabled={isLoading}
              size="small"
            />
          </InputContainer>
        </FormSection>

        <FormSection>
          <Label>Tiểu sử</Label>
          <InputContainer>
            <StyledTextField
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={isLoading}
              multiline
              rows={3}
              size="small"
            />
          </InputContainer>
        </FormSection>

        <Divider sx={{ my: 3 }} />

        <FormSection>
          <Label>Email</Label>
          <InputContainer>
            <StyledTextField
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
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
              loading={isLoading}
            >
              Gửi
            </LoadingButton>
          </InputContainer>
        </FormSection>
      </form>
    </PageContainer>
  );
};
