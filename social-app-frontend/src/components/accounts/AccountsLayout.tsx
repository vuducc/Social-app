import { Box, Paper, styled } from "@mui/material";
import { Outlet } from "react-router-dom";
import { AccountsSidebar } from "./AccountsSidebar";

const LayoutContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1100,
  margin: "0 auto",
  padding: theme.spacing(3),
  display: "flex",
  gap: theme.spacing(3),
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    padding: theme.spacing(0),
  },
}));

const ContentWrapper = styled(Paper)(({ theme }) => ({
  flex: 1,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down("md")]: {
    border: "none",
    borderRadius: 0,
  },
}));

export const AccountsLayout = () => {
  return (
    <LayoutContainer>
      <AccountsSidebar />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </LayoutContainer>
  );
};
