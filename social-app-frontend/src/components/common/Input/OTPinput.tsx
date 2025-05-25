import { useTheme } from "@mui/material";
import ReactOTPInput from "react-otp-input";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  currentIndex?: number;
}

export const OTPInput = ({ value, onChange }: OTPInputProps) => {
  const theme = useTheme();

  return (
    <ReactOTPInput
      value={value}
      onChange={onChange}
      numInputs={6}
      renderInput={(props) => <input {...props} />}
      shouldAutoFocus
      containerStyle={{
        gap: "8px",
        justifyContent: "center",
      }}
      inputStyle={{
        width: "40px",
        height: "40px",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: "8px",
        fontSize: "18px",
        textAlign: "center",
        backgroundColor: "transparent",
        color: theme.palette.text.primary,
        outline: "none",
      }}
    />
  );
};
