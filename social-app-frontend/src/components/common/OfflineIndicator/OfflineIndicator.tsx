import { Box, Typography, styled } from "@mui/material";
import { WifiOff, SignalWifiOff } from "@mui/icons-material";
import { useNetwork } from "../../../contexts/NetworkContext";

const IndicatorContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "quality",
})<{ quality: "good" | "slow" | "offline" }>(({ theme, quality }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor:
    quality === "offline"
      ? theme.palette.error.main
      : quality === "slow"
      ? theme.palette.warning.main
      : "transparent",
  color: theme.palette.common.white,
  padding: theme.spacing(1.5),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
  zIndex: 9999,
  animation: "slideUp 0.3s ease-out",
  boxShadow: theme.shadows[4],
  "@keyframes slideUp": {
    from: { transform: "translateY(100%)" },
    to: { transform: "translateY(0)" },
  },
}));

const MessageText = styled(Typography)({
  fontWeight: 500,
  textAlign: "center",
  lineHeight: 1.2,
});

export const OfflineIndicator = () => {
  const { connectionQuality } = useNetwork();

  if (connectionQuality === "good") return null;

  return (
    <IndicatorContainer quality={connectionQuality}>
      {connectionQuality === "offline" ? (
        <>
          <WifiOff />
          <MessageText>
            Mất kết nối internet. Vui lòng kiểm tra lại kết nối của bạn.
          </MessageText>
        </>
      ) : (
        <>
          <SignalWifiOff />
          <MessageText>
            Kết nối internet yếu. Một số tính năng có thể bị ảnh hưởng.
          </MessageText>
        </>
      )}
    </IndicatorContainer>
  );
};
