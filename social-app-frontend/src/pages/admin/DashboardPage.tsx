import { Box, Grid, Paper, Typography, useTheme } from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ReportIcon from "@mui/icons-material/Report";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { styled } from "@mui/material/styles";
import { useUserDetails, useDashboardStats } from "../../hooks/useStatistics";
import { LineChart } from "../../components/admin/charts/LineChart";
import { useState } from "react";
import { MenuItem, Select, FormControl } from "@mui/material";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  overflow: "hidden",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
  },
}));

const StatIcon = styled(Box)(({ theme }) => ({
  position: "absolute",
  right: theme.spacing(3),
  top: theme.spacing(3),
  opacity: 0.2,
  transform: "scale(2)",
}));

const StatCard = ({ title, value, icon, color }: any) => {
  return (
    <StyledPaper sx={{ "&::before": { backgroundColor: color } }}>
      <StatIcon sx={{ color }}>{icon}</StatIcon>
      <Typography
        variant="h6"
        sx={{
          mb: 1,
          color: "text.secondary",
          fontSize: "0.875rem",
          fontWeight: 500,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 600,
          background: `linear-gradient(45deg, ${color}, ${color}80)`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {value}
      </Typography>
    </StyledPaper>
  );
};

export const DashboardPage = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState(7);
  const { data: userDetails } = useUserDetails();
  const { data: dashboardStats } = useDashboardStats(timeRange);

  const stats = [
    {
      title: "Tổng số người dùng",
      value: userDetails?.total_users || 0,
      icon: <PeopleAltIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: "Người dùng hoạt động",
      value: userDetails?.total_active_users || 0,
      icon: <TrendingUpIcon />,
      color: theme.palette.success.main,
    },
    {
      title: "Tổng bài viết",
      value: userDetails?.total_posts || 0,
      icon: <ReportIcon />,
      color: theme.palette.info.main,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: "-8px",
              left: 0,
              width: "40px",
              height: "4px",
              backgroundColor: "primary.main",
              borderRadius: "2px",
            },
          }}
        >
          Dashboard
        </Typography>

        <FormControl size="small">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
          >
            <MenuItem value={7}>7 ngày qua</MenuItem>
            <MenuItem value={14}>14 ngày qua</MenuItem>
            <MenuItem value={30}>30 ngày qua</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} md={4} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: "400px" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Tăng trưởng người dùng
              </Typography>
              {dashboardStats && (
                <LineChart
                  data={{
                    labels: dashboardStats.user_growth.labels,
                    datasets: [
                      {
                        label: "Người dùng mới",
                        data: dashboardStats.user_growth.values,
                        borderColor: theme.palette.primary.main,
                        tension: 0.4,
                      },
                    ],
                  }}
                />
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: "400px" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Hoạt động bài viết
              </Typography>
              {dashboardStats && (
                <LineChart
                  data={{
                    labels: dashboardStats.post_activity.labels,
                    datasets: [
                      {
                        label: "Bài viết mới",
                        data: dashboardStats.post_activity.values,
                        borderColor: theme.palette.info.main,
                        tension: 0.4,
                      },
                    ],
                  }}
                />
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Chỉ số tương tác
          </Typography>
          {dashboardStats?.engagement_stats && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Trung bình bài viết/người dùng
                </Typography>
                <Typography variant="h4">
                  {dashboardStats.engagement_stats.avg_posts_per_user.toFixed(
                    2
                  )}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Trung bình bình luận/bài viết
                </Typography>
                <Typography variant="h4">
                  {dashboardStats.engagement_stats.avg_comments_per_post.toFixed(
                    2
                  )}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Trung bình lượt thích/bài viết
                </Typography>
                <Typography variant="h4">
                  {dashboardStats.engagement_stats.avg_likes_per_post.toFixed(
                    2
                  )}
                </Typography>
              </Grid>
            </Grid>
          )}
        </Paper>
      </Box>
    </Box>
  );
};
