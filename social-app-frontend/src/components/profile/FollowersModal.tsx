import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import { Avatar } from "../common/Avatar/Avatar";
import { userService } from "../../services/user.service";
import { styled } from "@mui/material/styles";
import { Button } from "../common/Button/Button";
import { useToggleFollow } from "../../hooks/useUser";
import { PaginatedUsers } from "../../types/user.types";

const UserItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1, 2),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const UserInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
}));

interface FollowersModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  type: "followers" | "following";
}

export const FollowersModal = ({
  open,
  onClose,
  userId,
  type,
  onFollowChange,
}: FollowersModalProps & { onFollowChange?: () => void }) => {
  const { ref, inView } = useInView();
  const toggleFollowMutation = useToggleFollow();

  const [followState, setFollowState] = useState<Record<string, boolean>>({});

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: [type, userId],
    queryFn: ({ pageParam = 1 }) =>
      type === "followers"
        ? userService.getFollowers(userId, pageParam)
        : userService.getFollowing(userId, pageParam),
    getNextPageParam: (lastPage: PaginatedUsers) => {
      const currentPage = Math.ceil(lastPage.users.length / 20);
      return lastPage.users.length < lastPage.total_count
        ? currentPage + 1
        : undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleToggleFollow = async (targetUserId: string) => {
    try {
      await toggleFollowMutation.mutateAsync(targetUserId);

      setFollowState((prev) => ({
        ...prev,
        [targetUserId]: !prev[targetUserId],
      }));

      if (onFollowChange) {
        onFollowChange();
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const users = data?.pages.flatMap((page) => page.users) || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {type === "followers" ? "Người theo dõi" : "Đang theo dõi"}
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {users.map((user) => {
              const isFollowing =
                followState[user.user_id] ?? user.is_following;

              return (
                <UserItem key={user.user_id}>
                  <UserInfo>
                    <Avatar src={user.profile_picture_url} size="medium" />
                    <Box>
                      <Typography variant="subtitle2">
                        {user.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.full_name}
                      </Typography>
                    </Box>
                  </UserInfo>
                  <Button
                    variant={isFollowing ? "outline" : "primary"}
                    size="small"
                    onClick={() => handleToggleFollow(user.user_id)}
                    disabled={toggleFollowMutation.isPending}
                  >
                    {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                  </Button>
                </UserItem>
              );
            })}
            {(hasNextPage || isLoading) && (
              <Box
                ref={ref}
                sx={{ display: "flex", justifyContent: "center", p: 2 }}
              >
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
