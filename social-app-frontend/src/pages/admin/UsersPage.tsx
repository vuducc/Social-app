import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  useAdminUsers,
  useToggleUserBan,
  useDeleteUser,
  useCreateUser,
} from "../../hooks/useAdminUsers";
import { UsersTable } from "../../components/admin/users/UsersTable";
import { LoadingButton } from "@mui/lab";

export const UsersPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
  });

  const { data: users, isLoading } = useAdminUsers();
  const toggleBanMutation = useToggleUserBan();
  const deleteUserMutation = useDeleteUser();
  const createUserMutation = useCreateUser();

  // Filter users based on search term
  const filteredUsers =
    users?.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            mb: 1,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: "-8px",
              left: 0,
              width: "40px",
              height: "4px",
              backgroundColor: "primary.main",
              borderRadius: "2px",
            },
          }}
        >
          Quản lý người dùng
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Quản lý tất cả người dùng trong hệ thống
        </Typography>
      </Box>

      {/* Action Bar */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <TextField
          placeholder="Tìm kiếm người dùng..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Lọc">
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Thêm người dùng
          </Button>
        </Box>
      </Paper>

      {/* Users Table */}
      <Paper sx={{ overflow: "hidden", borderRadius: 2 }}>
        <UsersTable
          users={filteredUsers}
          isLoading={isLoading}
          onBlockUser={(userId) =>
            toggleBanMutation.mutateAsync({ userId, action: "block" })
          }
          onUnblockUser={(userId) =>
            toggleBanMutation.mutateAsync({ userId, action: "unblock" })
          }
          onDeleteUser={(userId) => deleteUserMutation.mutateAsync(userId)}
        />
      </Paper>

      {/* Create User Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6">Thêm người dùng mới</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Điền thông tin để tạo tài khoản mới
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Tên người dùng"
              fullWidth
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />
            <TextField
              label="Mật khẩu"
              type="password"
              fullWidth
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setIsCreateDialogOpen(false)}
          >
            Hủy
          </Button>
          <LoadingButton
            variant="contained"
            onClick={() => {
              createUserMutation.mutateAsync({
                ...newUser,
                is_admin: false,
                full_name: newUser.username,
              });
              setIsCreateDialogOpen(false);
              setNewUser({ username: "", email: "", password: "" });
            }}
            loading={createUserMutation.isPending}
          >
            Tạo
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
