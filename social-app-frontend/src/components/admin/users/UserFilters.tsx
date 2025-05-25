import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

interface UserFiltersProps {
  searchTerm: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export const UserFilters = ({
  searchTerm,
  status,
  onSearchChange,
  onStatusChange,
}: UserFiltersProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        mb: 3,
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <TextField
        placeholder="Tìm kiếm người dùng..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flex: 1 }}
        size="small"
      />
      <FormControl sx={{ minWidth: 200 }} size="small">
        <InputLabel>Trạng thái</InputLabel>
        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          label="Trạng thái"
        >
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="active">Đang hoạt động</MenuItem>
          <MenuItem value="blocked">Đã chặn</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};
