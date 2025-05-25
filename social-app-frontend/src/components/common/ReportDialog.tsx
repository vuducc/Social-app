import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useCreateReport } from "../../hooks/useReport";

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  targetId: string;
  targetType: "POST" | "COMMENT";
}

const REPORT_REASONS = [
  "Nội dung không phù hợp",
  "Spam hoặc lừa đảo",
  "Quấy rối hoặc bắt nạt",
  "Vi phạm bản quyền",
  "Khác",
];

export const ReportDialog = ({
  open,
  onClose,
  targetId,
  targetType,
}: ReportDialogProps) => {
  const [reason, setReason] = useState("");
  const { mutate: createReport, isPending } = useCreateReport();

  const handleSubmit = () => {
    if (reason) {
      createReport(
        {
          type: targetType,
          content_id: targetId,
          reason,
        },
        {
          onSuccess: () => {
            onClose();
            setReason("");
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Báo cáo {targetType === "POST" ? "bài viết" : "bình luận"}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Vui lòng chọn lý do báo cáo:
        </Typography>
        <FormControl>
          <RadioGroup
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {REPORT_REASONS.map((item) => (
              <FormControlLabel
                key={item}
                value={item}
                control={<Radio />}
                label={item}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!reason || isPending}
        >
          Báo cáo
        </Button>
      </DialogActions>
    </Dialog>
  );
};
