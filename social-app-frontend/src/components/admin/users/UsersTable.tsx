import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Block, CheckCircle, Delete } from "@mui/icons-material";
import { useState } from "react";
import { ConfirmDialog } from "../ConfirmDialog";

interface UsersTableProps {
  users: any[];
  isLoading: boolean;
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export const UsersTable = ({
  users,
  isLoading,
  onBlockUser,
  onUnblockUser,
  onDeleteUser,
}: UsersTableProps) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    action: () => {},
  });

  const handleBlockUser = (userId: string, username: string) => {
    setConfirmDialog({
      open: true,
      title: "Chặn người dùng",
      message: `Bạn có chắc chắn muốn chặn người dùng "${username}"?`,
      action: () => onBlockUser(userId),
    });
  };

  const handleUnblockUser = (userId: string, username: string) => {
    setConfirmDialog({
      open: true,
      title: "Bỏ chặn người dùng",
      message: `Bạn có chắc chắn muốn bỏ chặn người dùng "${username}"?`,
      action: () => onUnblockUser(userId),
    });
  };

  const handleDeleteUser = (userId: string, username: string) => {
    setConfirmDialog({
      open: true,
      title: "Xóa người dùng",
      message: `Bạn có chắc chắn muốn xóa người dùng "${username}"? Hành động này không thể hoàn tác.`,
      action: () => onDeleteUser(userId),
    });
  };

  const columns: GridColDef[] = [
    { field: "username", headerName: "Tên người dùng", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "created_at",
      headerName: "Ngày tạo",
      width: 180,
      //   valueFormatter: ({ value }) => {
      //     if (!value) return "";
      //     return value.slice(0, 16).replace("T", " ");
      //   },
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          {params.row.is_banned ? (
            <Tooltip title="Hủy chặn người dùng">
              <IconButton
                color="success"
                onClick={() =>
                  handleUnblockUser(params.row.user_id, params.row.username)
                }
                size="small"
                disabled={params.row.is_admin}
              >
                <CheckCircle />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Chặn người dùng">
              <IconButton
                color="warning"
                onClick={() =>
                  handleBlockUser(params.row.user_id, params.row.username)
                }
                size="small"
                disabled={params.row.is_admin}
              >
                <Block />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Xóa người dùng">
            <IconButton
              color="error"
              onClick={() =>
                handleDeleteUser(params.row.user_id, params.row.username)
              }
              size="small"
              disabled={params.row.is_admin}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <>
      <DataGrid
        rows={users}
        columns={columns}
        loading={isLoading}
        getRowId={(row) => row.user_id}
        autoHeight
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        sx={{
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid",
            borderColor: "divider",
          },
        }}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.action();
          setConfirmDialog({ ...confirmDialog, open: false });
        }}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      />
    </>
  );
};
