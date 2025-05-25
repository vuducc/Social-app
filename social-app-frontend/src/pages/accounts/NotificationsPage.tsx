import {
  Box,
  Typography,
  styled,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
} from "@mui/material";
// import { useUpdateNotificationSettings } from "../../../hooks/useUser";

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
}));

const NotificationItem = styled(ListItem)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  padding: theme.spacing(1, 0),
}));

const NotificationLabel = styled(Box)({
  flex: 1,
});

export const NotificationsSettingPage = () => {
  // const [settings, setSettings] = useState({
  //   likes: true,
  //   comments: true,
  //   commentLikes: true,
  //   followRequests: true,
  //   reminders: true,
  //   productAnnouncements: false,
  //   supportRequests: true,
  //   emailNotifications: true,
  //   pushNotifications: true,
  // });

  //   const { mutate: updateSettings, isPending } = useUpdateNotificationSettings();

  // const handleChange = (name: keyof typeof settings) => {
    // return (event: React.ChangeEvent<HTMLInputElement>) => {
    //   const newSettings = {
    //     ...settings,
    //     [name]: event.target.checked,
    //   };
    //   setSettings(newSettings);
    //   updateSettings(newSettings);
    // };
  // };

  return (
    <PageContainer>
      <Section>
        <SectionTitle variant="h6">Thông báo đẩy</SectionTitle>
        <List disablePadding>
          <NotificationItem>
            <NotificationLabel>
              <Typography variant="subtitle2">Bật thông báo đẩy</Typography>
              <Typography variant="body2" color="text.secondary">
                Nhận thông báo về hoạt động trên ứng dụng
              </Typography>
            </NotificationLabel>
            <FormControlLabel
              control={
                <Switch
                  // checked={settings.pushNotifications}
                  //   onChange={handleChange("pushNotifications")}
                  //   disabled={isPending}
                />
              }
              label=""
            />
          </NotificationItem>
        </List>
      </Section>

      <Divider />

      <Section>
        <SectionTitle variant="h6">Tương tác</SectionTitle>
        <List disablePadding>
          <NotificationItem>
            <NotificationLabel>
              <Typography variant="subtitle2">Lượt thích</Typography>
              <Typography variant="body2" color="text.secondary">
                Thông báo khi có người thích bài viết của bạn
              </Typography>
            </NotificationLabel>
            <FormControlLabel
              control={
                <Switch
                  // checked={settings.likes}
                  //   onChange={handleChange("likes")}
                  //   disabled={isPending}
                />
              }
              label=""
            />
          </NotificationItem>

          <NotificationItem>
            <NotificationLabel>
              <Typography variant="subtitle2">Bình luận</Typography>
              <Typography variant="body2" color="text.secondary">
                Thông báo khi có người bình luận bài viết của bạn
              </Typography>
            </NotificationLabel>
            <FormControlLabel
              control={
                <Switch
                  // checked={settings.comments}
                  //   onChange={handleChange("comments")}
                  //   disabled={isPending}
                />
              }
              label=""
            />
          </NotificationItem>

          <NotificationItem>
            <NotificationLabel>
              <Typography variant="subtitle2">Lượt thích bình luận</Typography>
              <Typography variant="body2" color="text.secondary">
                Thông báo khi có người thích bình luận của bạn
              </Typography>
            </NotificationLabel>
            <FormControlLabel
              control={
                <Switch
                  // checked={settings.commentLikes}
                  //   onChange={handleChange("commentLikes")}
                  //   disabled={isPending}
                />
              }
              label=""
            />
          </NotificationItem>
        </List>
      </Section>

      <Divider />

      <Section>
        <SectionTitle variant="h6">Theo dõi và kết nối</SectionTitle>
        <List disablePadding>
          <NotificationItem>
            <NotificationLabel>
              <Typography variant="subtitle2">Yêu cầu theo dõi</Typography>
              <Typography variant="body2" color="text.secondary">
                Thông báo khi có người muốn theo dõi bạn
              </Typography>
            </NotificationLabel>
            <FormControlLabel
              control={
                <Switch
                  // checked={settings.followRequests}
                  //   onChange={handleChange("followRequests")}
                  //   disabled={isPending}
                />
              }
              label=""
            />
          </NotificationItem>
        </List>
      </Section>

      <Divider />

      <Section>
        <SectionTitle variant="h6">Email và SMS</SectionTitle>
        <List disablePadding>
          <NotificationItem>
            <NotificationLabel>
              <Typography variant="subtitle2">Thông báo qua email</Typography>
              <Typography variant="body2" color="text.secondary">
                Nhận thông báo qua email về hoạt động quan trọng
              </Typography>
            </NotificationLabel>
            <FormControlLabel
              control={
                <Switch
                  // checked={settings.emailNotifications}
                  //   onChange={handleChange("emailNotifications")}
                  //   disabled={isPending}
                />
              }
              label=""
            />
          </NotificationItem>
        </List>
      </Section>
    </PageContainer>
  );
};
