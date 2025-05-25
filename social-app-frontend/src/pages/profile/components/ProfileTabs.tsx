import { Box, Tab, Tabs, styled } from "@mui/material";
import { GridView, BookmarkBorder } from "@mui/icons-material";
import { useState } from "react";
import { ProfilePosts } from "./ProfilePosts";
import { ProfileSaved } from "./ProfileSaved";

const TabsContainer = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  marginTop: theme.spacing(4),
}));

const StyledTabs = styled(Tabs)({
  "& .MuiTab-root": {
    minWidth: 60,
    padding: "12px 16px",
    textTransform: "none",
    fontWeight: 600,
  },
});

interface ProfileTabsProps {
  userId: string;
}

export const ProfileTabs = ({ userId }: ProfileTabsProps) => {
  const [value, setValue] = useState(0);

  return (
    <TabsContainer>
      <StyledTabs
        value={value}
        onChange={(_, newValue) => setValue(newValue)}
        centered
      >
        <Tab icon={<GridView />} label="Bài viết" iconPosition="start" />
        <Tab icon={<BookmarkBorder />} label="Đã lưu" iconPosition="start" />
      </StyledTabs>

      {value === 0 && <ProfilePosts userId={userId} />}
      {value === 1 && <ProfileSaved />}
    </TabsContainer>
  );
};
