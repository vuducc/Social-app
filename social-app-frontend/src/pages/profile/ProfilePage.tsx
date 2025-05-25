import { Box, styled } from "@mui/material";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileTabs } from "./components/ProfileTabs";
import { useParams } from "react-router-dom";
import { LoadingSpinner } from "../../components/common/LoadingSpinner/LoadingSpinner";
import { useUserProfile } from "../../hooks/useUser";
import { useUserPosts } from "../../hooks/usePost";

const ProfileContainer = styled(Box)(({ theme }) => ({
  maxWidth: 935,
  margin: "0 auto",
  padding: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0),
  },
}));

interface ProfilePageProps {
  isOwnProfile?: boolean;
}

export const ProfilePage = ({ isOwnProfile }: ProfilePageProps) => {
  const { userId } = useParams();
  const { data: profile, isLoading } = useUserProfile(
    isOwnProfile ? undefined : userId
  );
  const { data: postsCount } = useUserPosts(profile?.user_id || "");

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return <div>Không tìm thấy người dùng</div>;
  }

  return (
    <ProfileContainer>
      <ProfileHeader
        profile={profile}
        postsCount={postsCount?.pages[0].total_posts || 0}
      />
      <ProfileTabs userId={profile.user_id} />
    </ProfileContainer>
  );
};
