import { styled } from "@mui/material/styles";
import { Popper, Box, ClickAwayListener } from "@mui/material";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

const StyledPopper = styled(Popper)(({ theme }) => ({
  marginTop: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
  zIndex: 1300,
}));

interface EmojiPickerPopperProps {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  onEmojiClick: (emojiData: EmojiClickData) => void;
  onClose: () => void;
}

export const EmojiPickerPopper = ({
  open,
  anchorEl,
  onEmojiClick,
  onClose,
}: EmojiPickerPopperProps) => {
  return (
    <StyledPopper
      open={open}
      anchorEl={anchorEl}
      placement="top-start"
    >
      <ClickAwayListener onClickAway={onClose}>
        <Box>
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            autoFocusSearch={false}
            width={320}
            height={400}
          />
        </Box>
      </ClickAwayListener>
    </StyledPopper>
  );
}; 