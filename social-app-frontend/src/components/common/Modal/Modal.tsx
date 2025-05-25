import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  styled,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 12,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1),
  "& .MuiTypography-root": {
    fontWeight: 600,
  },
}));

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const Modal = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
}: ModalProps) => {
  return (
    <StyledDialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      {title && (
        <StyledDialogTitle>
          <Typography variant="h6">{title}</Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "text.secondary",
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "rotate(90deg)",
                color: "text.primary",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>
      )}
      <DialogContent>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </StyledDialog>
  );
};
