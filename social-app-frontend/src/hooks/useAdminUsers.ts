import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/user.service";
import toast from "react-hot-toast";

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => userService.getAllUsers(),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("Tạo người dùng thành công");
    },
    onError: () => {
      toast.error("Không thể tạo người dùng. Vui lòng thử lại!");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("Xóa người dùng thành công");
    },
    onError: () => {
      toast.error("Không thể xóa người dùng. Vui lòng thử lại!");
    },
  });
};

export const useToggleUserBan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      action,
    }: {
      userId: string;
      action: "block" | "unblock";
    }) =>
      action === "block"
        ? userService.banUser(userId)
        : userService.unbanUser(userId),
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success(
        `${action === "block" ? "Chặn" : "Bỏ chặn"} người dùng thành công`
      );
    },
    onError: () => {
      toast.error("Không thể thực hiện thao tác. Vui lòng thử lại!");
    },
  });
};
