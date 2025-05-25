import {
  Box,
  Typography,
  styled,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Paper,
} from "@mui/material";
import {
  ExpandMore,
  Search,
  Article,
  Security,
  Help,
  BugReport,
  ContactSupport,
} from "@mui/icons-material";
import { useState } from "react";

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const SearchSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
}));

const SearchField = styled(TextField)(({ theme }) => ({
  width: "100%",
  maxWidth: 600,
  backgroundColor: theme.palette.background.paper,
}));

const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  "&:before": {
    display: "none",
  },
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(1),
}));

const QuickLinks = styled(List)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const QuickLinkItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  cursor: "pointer",
  transition: "all 0.2s",
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const faqData = [
  {
    question: "Làm thế nào để bảo mật tài khoản của tôi?",
    answer:
      "Để bảo mật tài khoản, bạn nên: \n- Sử dụng mật khẩu mạnh\n- Bật xác thực hai yếu tố\n- Không chia sẻ thông tin đăng nhập\n- Thường xuyên kiểm tra hoạt động đăng nhập",
  },
  {
    question: "Làm sao để khôi phục tài khoản bị vô hiệu hóa?",
    answer:
      "Nếu tài khoản của bạn bị vô hiệu hóa, bạn có thể:\n1. Đăng nhập vào tài khoản\n2. Làm theo hướng dẫn khôi phục\n3. Liên hệ bộ phận hỗ trợ nếu cần thêm trợ giúp",
  },
  {
    question: "Làm thế nào để xóa tài khoản vĩnh viễn?",
    answer:
      "Để xóa tài khoản vĩnh viễn:\n1. Vào Cài đặt > Quyền riêng tư\n2. Chọn 'Xóa tài khoản'\n3. Xác nhận yêu cầu xóa\nLưu ý: Hành động này không thể hoàn tác",
  },
  {
    question: "Chính sách về nội dung bị báo cáo?",
    answer:
      "Khi nội dung bị báo cáo:\n1. Hệ thống sẽ xem xét báo cáo\n2. Nội dung vi phạm sẽ bị gỡ bỏ\n3. Tài khoản có thể bị hạn chế nếu vi phạm nhiều lần",
  },
];

const quickLinks = [
  {
    icon: <Article />,
    title: "Hướng dẫn sử dụng",
    description: "Tìm hiểu cách sử dụng các tính năng cơ bản",
  },
  {
    icon: <Security />,
    title: "Bảo mật & Quyền riêng tư",
    description: "Thông tin về cài đặt bảo mật và quyền riêng tư",
  },
  {
    icon: <BugReport />,
    title: "Báo cáo sự cố",
    description: "Báo cáo lỗi hoặc vấn đề kỹ thuật",
  },
  {
    icon: <ContactSupport />,
    title: "Liên hệ hỗ trợ",
    description: "Nhận trợ giúp từ đội ngũ hỗ trợ của chúng tôi",
  },
];

export const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <PageContainer>
      <SearchSection>
        <Typography variant="h6" gutterBottom>
          Bạn cần giúp đỡ?
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Tìm kiếm câu trả lời nhanh chóng cho câu hỏi của bạn
        </Typography>
        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          <SearchField
            placeholder="Tìm kiếm trợ giúp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />,
            }}
          />
          <Button variant="contained">Tìm kiếm</Button>
        </Box>
      </SearchSection>

      <Section>
        <SectionTitle variant="h6">Truy cập nhanh</SectionTitle>
        <QuickLinks>
          {quickLinks.map((link, index) => (
            <QuickLinkItem key={index}>
              <ListItem disablePadding>
                <ListItemIcon>{link.icon}</ListItemIcon>
                <ListItemText
                  primary={link.title}
                  secondary={link.description}
                  primaryTypographyProps={{ variant: "subtitle2" }}
                />
              </ListItem>
            </QuickLinkItem>
          ))}
        </QuickLinks>
      </Section>

      <Section>
        <SectionTitle variant="h6">Câu hỏi thường gặp</SectionTitle>
        {faqData.map((faq, index) => (
          <StyledAccordion key={index}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: "pre-line" }}
              >
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </StyledAccordion>
        ))}
      </Section>

      <Section>
        <Box textAlign="center">
          <Typography variant="subtitle1" gutterBottom>
            Không tìm thấy câu trả lời bạn cần?
          </Typography>
          <Button variant="contained" startIcon={<Help />} sx={{ mt: 1 }}>
            Liên hệ hỗ trợ
          </Button>
        </Box>
      </Section>
    </PageContainer>
  );
};
