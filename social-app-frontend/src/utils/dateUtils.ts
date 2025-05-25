import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

export const formatTimeAgo = (date: string) => {
  return formatDistanceToNowStrict(parseISO(date), {
    addSuffix: true,
    locale: vi,
  });
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};
