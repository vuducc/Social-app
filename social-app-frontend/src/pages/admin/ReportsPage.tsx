import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Avatar,
} from "@mui/material";
import { useReports, useUpdateReport } from "../../hooks/useReport";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button } from "../../components/common/Button/Button";
import { LoadingButton } from "@mui/lab";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  usePost,
  useDeletePost,
  useAdminDeletePost,
} from "../../hooks/usePost";
import {
  useComment,
  useDeleteComment,
  useAdminDeleteComment,
} from "../../hooks/useComment";
import { Post } from "../../types/post.types";
import { Comment } from "../../types/comment.types";

export const ReportsPage = () => {
  const [status, setStatus] = useState<string>("PENDING");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reportedPost, setReportedPost] = useState<Post | null>(null);
  const [reportedComment, setReportedComment] = useState<Comment | null>(null);
  const [note, setNote] = useState("");
  const { data: reports, isLoading } = useReports(status);
  const updateReportMutation = useUpdateReport();

  const { data: post } = usePost(
    selectedReport?.type === "POST" ? selectedReport?.content_id : ""
  );

  const { data: comment } = useComment(
    selectedReport?.type === "COMMENT" ? selectedReport?.content_id : ""
  );

  const deletePostMutation = useDeletePost();
  const deleteCommentMutation = useDeleteComment();
  const adminDeletePostMutation = useAdminDeletePost();
  const adminDeleteCommentMutation = useAdminDeleteComment();

  useEffect(() => {
    if (selectedReport?.type === "POST" && post) {
      setReportedPost(post);
    } else if (selectedReport?.type === "COMMENT" && comment) {
      setReportedComment(comment);
    }
  }, [selectedReport, post, comment]);

  const handleStatusChange = (_: any, newValue: string) => {
    setStatus(newValue);
  };

  const handleViewDetail = (report: any) => {
    setSelectedReport(report);
  };

  const handleAction = (reportId: string, status: "RESOLVED" | "REJECTED") => {
    const report = reports?.find((r) => r.report_id === reportId);
    setSelectedReport({ ...report, actionStatus: status });
  };

  const handleConfirmAction = async () => {
    if (!selectedReport) return;

    await updateReportMutation.mutateAsync({
      reportId: selectedReport.report_id,
      data: {
        status: selectedReport.actionStatus,
        admin_note: note,
      },
    });

    setSelectedReport(null);
    setNote("");
  };

  const handleUpdateReport = async (status: "RESOLVED" | "REJECTED") => {
    if (!selectedReport) return;

    try {
      await updateReportMutation.mutateAsync({
        reportId: selectedReport.report_id,
        data: {
          status,
          admin_note: note,
        },
      });

      if (
        status === "RESOLVED" &&
        selectedReport.type === "POST" &&
        reportedPost
      ) {
        await deletePostMutation.mutateAsync(reportedPost.post_id);
      }

      if (
        status === "RESOLVED" &&
        selectedReport.type === "COMMENT" &&
        reportedComment
      ) {
        await deleteCommentMutation.mutateAsync(reportedComment.comment_id);
      }

      setSelectedReport(null);
      setNote("");
      setReportedPost(null);
      setReportedComment(null);
    } catch (error) {
      console.error("Error handling report:", error);
    }
  };

  const handleDeleteContent = async () => {
    if (!selectedReport) return;

    try {
      if (selectedReport.type === "POST") {
        await adminDeletePostMutation.mutateAsync(selectedReport.content_id);
      } else if (selectedReport.type === "COMMENT") {
        await adminDeleteCommentMutation.mutateAsync(selectedReport.content_id);
      }

      // Update report status after successful deletion
      await updateReportMutation.mutateAsync({
        reportId: selectedReport.report_id,
        data: {
          status: "RESOLVED",
          admin_note: "Đã xóa nội dung vi phạm",
        },
      });

      setSelectedReport(null);
    } catch (error) {
      console.error("Error deleting content:", error);
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig: Record<
      string,
      { color: "default" | "success" | "error" | "warning"; label: string }
    > = {
      PENDING: { color: "warning", label: "Đang chờ" },
      RESOLVED: { color: "success", label: "Đã xử lý" },
      REJECTED: { color: "error", label: "Đã từ chối" },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return <Chip size="small" color={config.color} label={config.label} />;
  };

  const columns: GridColDef[] = [
    {
      field: "type",
      headerName: "Loại vi phạm",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === "POST" ? "primary" : "secondary"}
        />
      ),
    },
    {
      field: "reason",
      headerName: "Lý do",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "created_at",
      headerName: "Ngày báo cáo",
      width: 180,
    },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 130,
      renderCell: (params) => getStatusChip(params.value),
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Xem chi tiết">
            <IconButton
              size="small"
              onClick={() => handleViewDetail(params.row)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            color="primary"
            onClick={() => handleAction(params.row.report_id, "RESOLVED")}
            disabled={params.row.status !== "PENDING"}
          >
            Chấp nhận
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => handleAction(params.row.report_id, "REJECTED")}
            disabled={params.row.status !== "PENDING"}
          >
            Từ chối
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Quản lý báo cáo vi phạm
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={status} onChange={handleStatusChange}>
          <Tab label="Đang chờ xử lý" value="PENDING" />
          <Tab label="Đã xử lý" value="RESOLVED" />
          <Tab label="Đã từ chối" value="REJECTED" />
        </Tabs>
      </Paper>

      <Paper>
        <DataGrid
          rows={reports || []}
          columns={columns}
          getRowId={(row) => row.report_id}
          loading={isLoading}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
        />
      </Paper>

      {/* Dialog xem chi tiết báo cáo */}
      <Dialog
        open={!!selectedReport && !selectedReport.actionStatus}
        onClose={() => setSelectedReport(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết báo cáo</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Thông tin báo cáo */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600}>
                Loại vi phạm: {selectedReport?.type}
              </Typography>
              <Typography>Lý do: {selectedReport?.reason}</Typography>
            </Grid>

            {/* Hiển thị chi tiết post nếu type là POST */}
            {selectedReport?.type === "POST" && reportedPost && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Avatar
                        src={reportedPost.user_profile_picture_url || ""}
                      />
                      <Typography>{reportedPost.user_username}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {reportedPost.content}
                    </Typography>
                    {reportedPost.image_urls?.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <img
                          src={reportedPost.image_urls[0]}
                          alt="Post content"
                          style={{ maxWidth: "100%", maxHeight: 300 }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Hiển thị chi tiết comment nếu type là COMMENT */}
            {selectedReport?.type === "COMMENT" && reportedComment && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Avatar
                        src={reportedComment.user?.profile_picture_url || ""}
                      />
                      <Typography>{reportedComment.user?.username}</Typography>
                    </Box>
                    <Typography variant="body2">
                      {reportedComment.content}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Form xử lý báo cáo */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Ghi chú xử lý"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            loading={updateReportMutation.isPending}
            onClick={() => handleUpdateReport("REJECTED")}
            color="error"
          >
            Từ chối
          </LoadingButton>
          <LoadingButton
            loading={
              updateReportMutation.isPending ||
              adminDeletePostMutation.isPending ||
              adminDeleteCommentMutation.isPending
            }
            onClick={handleDeleteContent}
            color="error"
            variant="contained"
          >
            Xóa nội dung
          </LoadingButton>
          <LoadingButton
            loading={updateReportMutation.isPending}
            onClick={() => handleUpdateReport("RESOLVED")}
            color="primary"
            variant="contained"
          >
            Chấp nhận
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Dialog xử lý báo cáo */}
      <Dialog
        open={!!selectedReport?.actionStatus}
        onClose={() => setSelectedReport(null)}
      >
        <DialogTitle>
          {selectedReport?.actionStatus === "RESOLVED"
            ? "Chấp nhận báo cáo"
            : "Từ chối báo cáo"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Ghi chú xử lý"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedReport(null)}>Hủy</Button>
          <LoadingButton
            variant="contained"
            onClick={handleConfirmAction}
            loading={updateReportMutation.isPending}
          >
            Xác nhận
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
