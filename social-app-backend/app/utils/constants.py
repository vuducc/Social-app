from enum import Enum


class NotificationTypes(str, Enum):
    # Tương tác cơ bản
    FOLLOW = "FOLLOW"  # Ai đó theo dõi bạn
    FOLLOW_REQUEST = "FOLLOW_REQUEST"  # Yêu cầu theo dõi (với tài khoản riêng tư)

    # Bài viết
    NEW_POST = "NEW_POST"  # Người bạn theo dõi đăng bài mới
    POST_LIKE = "POST_LIKE"  # Ai đó thích bài viết của bạn
    POST_COMMENT = "POST_COMMENT"  # Ai đó bình luận bài viết của bạn
    POST_MENTION = "POST_MENTION"  # Ai đó tag bạn trong bài viết

    # Bình luận
    COMMENT_LIKE = "COMMENT_LIKE"  # Ai đó thích bình luận của bạn
    COMMENT_REPLY = "COMMENT_REPLY"  # Ai đó trả lời bình luận của bạn
    COMMENT_MENTION = "COMMENT_MENTION"  # Ai đó tag bạn trong bình luận
    NEW_COMMENT = "NEW_COMMENT"  # Bình luận mới

    # Tin nhắn
    NEW_MESSAGE = "NEW_MESSAGE"  # Tin nhắn mới
    MESSAGE_REQUEST = "MESSAGE_REQUEST"  # Yêu cầu nhắn tin (với người lạ)

    # Hệ thống
    SYSTEM = "SYSTEM"  # Thông báo từ hệ thống
    ACCOUNT = "ACCOUNT"  # Thông báo về tài khoản
    REPORT = "REPORT"  # Thông báo về báo cáo
