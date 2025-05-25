import { styled } from "@mui/material";
import { CameraAlt } from "@mui/icons-material";
import { useRef } from "react";
import defaultAvatar from "../../../assets/images/default_avatar.jpg";

const AvatarWrapper = styled("div")<{
  size?: "small" | "medium" | "large";
  $disabled?: boolean;
  style?: React.CSSProperties;
}>(({ size = "medium", $disabled, style }) => ({
  position: "relative",
  width: size === "large" ? 150 : size === "medium" ? 40 : 32,
  height: size === "large" ? 150 : size === "medium" ? 40 : 32,
  borderRadius: "50%",
  overflow: "hidden",
  cursor: $disabled ? "default" : "pointer",
  opacity: $disabled ? 0.7 : 1,
  ...style,
}));

const StyledAvatar = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const EditOverlay = styled("div")<{ $disabled?: boolean }>(({ $disabled }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0,
  transition: "opacity 0.2s",
  cursor: $disabled ? "default" : "pointer",
  "&:hover": {
    opacity: $disabled ? 0 : 1,
  },
}));

const HiddenInput = styled("input")({
  display: "none",
});

export interface AvatarProps {
  src: string | null;
  size?: "small" | "medium" | "large";
  editable?: boolean;
  disabled?: boolean;
  onFileSelect?: (file: File) => void;
  alt?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Avatar = ({
  src,
  size = "medium",
  editable,
  disabled = false,
  onFileSelect,
  alt = "Avatar",
  onClick,
  style,
}: AvatarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (editable && !disabled) {
      inputRef.current?.click();
    } else if (onClick) {
      onClick();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileSelect && !disabled) {
      onFileSelect(file);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = defaultAvatar;
  };

  return (
    <AvatarWrapper
      size={size}
      onClick={handleClick}
      $disabled={disabled}
      style={style}
    >
      <StyledAvatar
        src={src || defaultAvatar}
        alt={alt}
        onError={handleImageError}
      />
      {editable && !disabled && (
        <>
          <EditOverlay $disabled={disabled}>
            <CameraAlt sx={{ color: "white" }} />
          </EditOverlay>
          <HiddenInput
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </>
      )}
    </AvatarWrapper>
  );
};
