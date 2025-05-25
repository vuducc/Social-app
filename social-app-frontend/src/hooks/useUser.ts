import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "./useRedux";
import { userService } from "../services/user.service";
import { setProfile } from "../store/slices/userSlice";
import toast from "react-hot-toast";

export const useUserProfile = (user_id?: string) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const profiles = useAppSelector((state) => state.user.profiles);

  return useQuery({
    queryKey: ["userProfile", user_id],
    queryFn: async () => {
      if (!user_id) {
        const data = await userService.getCurrentUser();
        const profileData = {
          ...data,
          is_current_user: true,
        };
        dispatch(setProfile(profileData));
        return profileData;
      }

      if (profiles[user_id]) {
        return profiles[user_id];
      }

      const data = await userService.getUserProfile(user_id);
      const profileData = {
        ...data,
        is_current_user: currentUser?.user_id === data.user_id,
      };

      dispatch(setProfile(profileData));
      return profileData;
    },
    staleTime: 5 * 60 * 1000,
    enabled: currentUser != null,
  });
};

export const useToggleFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.toggleFollow,
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["userProfile", userId] });

      const previousProfile = queryClient.getQueryData(["userProfile", userId]);

      queryClient.setQueryData(["userProfile", userId], (old: any) => {
        if (!old) return old;
        const newProfile = {
          ...old,
          is_following: !old.is_following,
          followers_count: old.is_following
            ? old.followers_count - 1
            : old.followers_count + 1,
        };
        return newProfile;
      });

      return { previousProfile };
    },
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({
        queryKey: ["userProfile", userId],
      });
      toast.success(data.message);
    },
    onError: (error, userId, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          ["userProfile", userId],
          context.previousProfile
        );
      }
      toast.error("Có lỗi xảy ra khi thực hiện thao tác này: " + error.message);
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (updatedUser) => {
      dispatch(setProfile(updatedUser));
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Cập nhật thông tin thành công!");
    },
    onError: (error) => {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin: " + error.message);
    },
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: userService.updateAvatar,
    onSuccess: (updatedUser) => {
      dispatch(setProfile(updatedUser));
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Cập nhật ảnh đại diện thành công!");
    },
    onError: (error) => {
      toast.error("Có lỗi xảy ra khi cập nhật ảnh đại diện: " + error.message);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: { old_password: string; new_password: string }) =>
      userService.changePassword(data),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể đổi mật khẩu");
    },
  });
};

export const useUsers = (search?: string) => {
  return useQuery({
    queryKey: ["users", search],
    queryFn: () => userService.searchUsers(search || ""),
  });
};

export const useSuggestedUsers = (limit: number = 5) => {
  return useQuery({
    queryKey: ["suggestedUsers", limit],
    queryFn: () => userService.getSuggestedUsers(limit),
  });
};
