import { Box, Typography } from "@mui/material";
import { useAppSelector } from "../../../hooks/useRedux";

export const ProfileSaved = () => {
  const currentUser = useAppSelector((state) => state.auth.user);

  if (!currentUser?.is_current_user) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography>Chỉ bạn mới có thể xem những gì mình đã lưu</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <Typography>Tính năng đang được phát triển</Typography>
    </Box>
  );
};
