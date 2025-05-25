import {
  Box,
  Typography,
  styled,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  Button,
  // Dialog,
  // DialogTitle,
  // DialogContent,
  // DialogActions,
} from "@mui/material";
// import { useState } from "react";
// import { useUpdatePrivacySettings } from "../../../hooks/useUser";
// import { LoadingButton } from "@mui/lab";

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

const PrivacyItem = styled(ListItem)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  padding: theme.spacing(1, 0),
}));

const PrivacyLabel = styled(Box)({
  flex: 1,
});

const DangerButton = styled(Button)(({ theme }) => ({
  color: theme.palette.error.main,
  borderColor: theme.palette.error.main,
  "&:hover": {
    borderColor: theme.palette.error.dark,
    backgroundColor: theme.palette.error.light,
  },
}));

export const PrivacyPage = () => {
  // const [settings, setSettings] = useState({
  //   privateAccount: false,
  //   activityStatus: true,
  //   storySharing: true,
  //   mentionsAllowance: "everyone", // everyone, following, none
  //   taggingAllowance: "everyone",
  // });

  // const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
//   const { mutate: updateSettings, isPending } = useUpdatePrivacySettings();

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
        <SectionTitle variant="h6">Quyền riêng tư tài khoản</SectionTitle>
        <List disablePadding>
          <PrivacyItem>
            <PrivacyLabel>
              <Typography variant="subtitle2">Tài khoản riêng tư</Typography>
              <Typography variant="body2" color="text.secondary">
                Khi bật tính năng này, chỉ những người theo dõi bạn mới có thể
                xem ảnh và video của bạn
              </Typography>
            </PrivacyLabel>
            <FormControlLabel
              control={
                <Switch
                  // checked={settings.privateAccount}
                //   onChange={handleChange("privateAccount")}
                  //   disabled={isPending}
                />
              }
              label=""
            />
          </PrivacyItem>

          <PrivacyItem>
            <PrivacyLabel>
              <Typography variant="subtitle2">Trạng thái hoạt động</Typography>
              <Typography variant="body2" color="text.secondary">
                Cho phép người khác thấy khi bạn đang hoạt động
              </Typography>
            </PrivacyLabel>
            <FormControlLabel
              control={
                <Switch
                  // checked={settings.activityStatus}
                //   onChange={handleChange("activityStatus")}
                //   disabled={isPending}
                />
              }
              label=""
            />
          </PrivacyItem>

          <PrivacyItem>
            <PrivacyLabel>
              <Typography variant="subtitle2">Chia sẻ tin</Typography>
              <Typography variant="body2" color="text.secondary">
                Cho phép người khác chia sẻ tin của bạn
              </Typography>
            </PrivacyLabel>
            <FormControlLabel
              control={
                <Switch
                  // checked={settings.storySharing}
                //   onChange={handleChange("storySharing")}
                //   disabled={isPending}
                />
              }
              label=""
            />
          </PrivacyItem>
        </List>
      </Section>

      <Divider />

      <Section>
        <SectionTitle variant="h6">Tương tác</SectionTitle>
        <List disablePadding>
          <PrivacyItem>
            <PrivacyLabel>
              <Typography variant="subtitle2">Nhắc đến và gắn thẻ</Typography>
              <Typography variant="body2" color="text.secondary">
                Kiểm soát ai có thể nhắc đến hoặc gắn thẻ bạn
              </Typography>
            </PrivacyLabel>
            <Button variant="text" color="primary">
              Chỉnh sửa
            </Button>
          </PrivacyItem>
        </List>
      </Section>

      <Divider />

      <Section>
        <SectionTitle variant="h6" color="error">
          Vùng nguy hiểm
        </SectionTitle>
        <List disablePadding>
          <PrivacyItem>
            <PrivacyLabel>
              <Typography variant="subtitle2" color="error">
                Tạm vô hiệu hóa tài khoản
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tạm thời ẩn tài khoản của bạn
              </Typography>
            </PrivacyLabel>
            <DangerButton
              variant="outlined"
              // onClick={() => setShowDeactivateDialog(true)}
            >
              Tạm vô hiệu hóa
            </DangerButton>
          </PrivacyItem>
        </List>
      </Section>

      {/* Dialog xác nhận vô hiệu hóa tài khoản */}
      {/* <Dialog
        open={showDeactivateDialog}
        onClose={() => setShowDeactivateDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Tạm vô hiệu hóa tài khoản?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Tài khoản của bạn sẽ bị ẩn cho đến khi bạn đăng nhập lại. Tất cả dữ
            liệu của bạn vẫn được giữ nguyên.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeactivateDialog(false)}>Hủy</Button>
          <LoadingButton
            variant="contained"
            color="error"
            // loading={isPending}
            onClick={() => {
              // Xử lý vô hiệu hóa tài khoản
              setShowDeactivateDialog(false);
            }}
          >
            Tạm vô hiệu hóa
          </LoadingButton>
        </DialogActions>
      </Dialog> */}
    </PageContainer>
  );
};
