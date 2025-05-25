import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Button } from "../common/Button/Button";

interface AdminPromptModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const AdminPromptModal = ({
  open,
  onClose,
  onConfirm,
}: AdminPromptModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Chuyển đến trang quản trị</DialogTitle>
      <DialogContent>
        <Typography>
          Bạn có quyền truy cập vào trang quản trị. Bạn có muốn chuyển đến trang
          quản trị không?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={onClose}>
          Ở lại trang người dùng
        </Button>
        <LoadingButton variant="contained" onClick={onConfirm}>
          Đi đến trang quản trị
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
