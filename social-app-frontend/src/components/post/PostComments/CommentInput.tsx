import { styled } from "@mui/material/styles";
import { Box, TextField, Button, IconButton } from "@mui/material";
import { EmojiEmotions as EmojiIcon } from "@mui/icons-material";
import { useState, useRef } from "react";
import { useCreateComment } from "../../../hooks/useComment";
import { EmojiPickerPopper } from "./EmojiPickerPopper";

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const InputWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  flex: 1,
  "& .MuiInputBase-root": {
    padding: 0,
  },
  "& .MuiInputBase-input": {
    fontSize: "0.875rem",
    "&::placeholder": {
      color: theme.palette.text.secondary,
    },
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "transparent",
    color: theme.palette.primary.dark,
  },
}));

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  postId: string;
  replyTo?: {
    username: string;
    commentId: string;
  } | null;
  onCancelReply?: () => void;
}

export const CommentInput = ({
  value,
  onChange,
  postId,
  replyTo,
  onCancelReply,
}: CommentInputProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  const { mutate: createComment, isPending } = useCreateComment();

  const handleSubmit = () => {
    if (value.trim() && !isPending) {
      createComment({
        content: replyTo ? value.replace(`@${replyTo.username} `, "") : value,
        post_id: postId,
        parent_id: replyTo?.commentId,
      });
      onChange("");
      if (onCancelReply) {
        onCancelReply();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <InputContainer>
      <InputWrapper>
        <IconButton
          ref={emojiButtonRef}
          size="small"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          sx={{ color: showEmojiPicker ? "primary.main" : "text.secondary" }}
        >
          <EmojiIcon />
        </IconButton>

        <StyledTextField
          fullWidth
          placeholder={
            replyTo ? `Trả lời ${replyTo.username}...` : "Thêm bình luận..."
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isPending}
          multiline
          maxRows={4}
          variant="standard"
          InputProps={{
            disableUnderline: true,
          }}
        />

        {value.trim() && (
          <ActionButton onClick={handleSubmit} disabled={isPending}>
            Đăng
          </ActionButton>
        )}

        {replyTo && (
          <ActionButton
            onClick={onCancelReply}
            sx={{ color: "text.secondary" }}
          >
            Hủy
          </ActionButton>
        )}
      </InputWrapper>

      <EmojiPickerPopper
        open={showEmojiPicker}
        anchorEl={emojiButtonRef.current}
        onEmojiClick={(emojiData) => {
          onChange(value + emojiData.emoji);
          setShowEmojiPicker(false);
        }}
        onClose={() => setShowEmojiPicker(false)}
      />
    </InputContainer>
  );
};
