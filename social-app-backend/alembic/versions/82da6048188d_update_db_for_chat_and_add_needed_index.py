"""update db for chat and add needed index

Revision ID: 82da6048188d
Revises: 82a3853ac494
Create Date: 2024-11-15 11:49:50.722786

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '82da6048188d'
down_revision: Union[str, None] = '82a3853ac494'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    message_type_enum = sa.Enum('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', name='messagetype')
    message_type_enum.create(op.get_bind(), checkfirst=True)

    op.create_table('deleted_conversations',
    sa.Column('id', sa.String(length=50), nullable=False),
    sa.Column('conversation_id', sa.String(length=50), nullable=True),
    sa.Column('user_id', sa.String(length=50), nullable=True),
    sa.Column('deleted_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['conversation_id'], ['conversations.conversation_id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('participants',
    sa.Column('participant_id', sa.String(length=50), nullable=False),
    sa.Column('conversation_id', sa.String(length=50), nullable=True),
    sa.Column('user_id', sa.String(length=50), nullable=True),
    sa.Column('type', sa.Enum('SINGLE', 'GROUP', name='participanttype'), nullable=False),
    sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['conversation_id'], ['conversations.conversation_id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('participant_id')
    )
    op.create_index('ix_participants_conversation_id', 'participants', ['conversation_id'], unique=False)
    op.create_index('ix_participants_user_id', 'participants', ['user_id'], unique=False)
    op.create_table('deleted_messages',
    sa.Column('id', sa.String(length=50), nullable=False),
    sa.Column('message_id', sa.String(length=50), nullable=True),
    sa.Column('user_id', sa.String(length=50), nullable=True),
    sa.Column('deleted_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['message_id'], ['messages.message_id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_comments_post_id', 'comments', ['post_id'], unique=False)
    op.create_index('ix_comments_user_id', 'comments', ['user_id'], unique=False)
    op.add_column('conversations', sa.Column('title', sa.String(length=255), nullable=True))
    op.add_column('conversations', sa.Column('creator_id', sa.String(length=50), nullable=True))
    op.add_column('conversations', sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True))
    op.add_column('conversations', sa.Column('deleted_at', sa.TIMESTAMP(), nullable=True))
    op.drop_constraint('unique_conversation', 'conversations', type_='unique')
    op.create_index('ix_conversations_creator_id', 'conversations', ['creator_id'], unique=False)
    op.drop_constraint('conversations_user1_id_fkey', 'conversations', type_='foreignkey')
    op.drop_constraint('conversations_user2_id_fkey', 'conversations', type_='foreignkey')
    op.create_foreign_key(None, 'conversations', 'users', ['creator_id'], ['user_id'])
    op.drop_column('conversations', 'user1_id')
    op.drop_column('conversations', 'user2_id')
    op.create_index('ix_follows_following_id', 'follows', ['following_id'], unique=False)
    op.create_index('ix_follows_user_id', 'follows', ['user_id'], unique=False)
    op.create_index('ix_likes_post_id', 'likes', ['post_id'], unique=False)
    op.create_index('ix_likes_user_id', 'likes', ['user_id'], unique=False)
    op.add_column('messages', sa.Column('message_type', sa.Enum('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', name='messagetype'), nullable=False))
    op.add_column('messages', sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True))
    op.create_index('ix_messages_conversation_id', 'messages', ['conversation_id'], unique=False)
    op.create_index('ix_messages_sender_id', 'messages', ['sender_id'], unique=False)
    op.drop_column('messages', 'is_edited')
    op.drop_column('messages', 'deleted_at')
    op.drop_column('messages', 'edited_at')
    op.drop_column('messages', 'status')
    op.create_index('ix_posts_user_id', 'posts', ['user_id'], unique=False)
    op.create_index('ix_users_email', 'users', ['email'], unique=False)
    op.create_index('ix_users_username', 'users', ['username'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('ix_users_username', table_name='users')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_posts_user_id', table_name='posts')
    op.add_column('messages', sa.Column('status', postgresql.ENUM('SENT', 'DELIVERED', 'READ', name='messagestatus'), autoincrement=False, nullable=True))
    op.add_column('messages', sa.Column('edited_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True))
    op.add_column('messages', sa.Column('deleted_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True))
    op.add_column('messages', sa.Column('is_edited', sa.BOOLEAN(), autoincrement=False, nullable=True))
    op.drop_index('ix_messages_sender_id', table_name='messages')
    op.drop_index('ix_messages_conversation_id', table_name='messages')
    op.drop_column('messages', 'updated_at')
    op.drop_column('messages', 'message_type')
    op.drop_index('ix_likes_user_id', table_name='likes')
    op.drop_index('ix_likes_post_id', table_name='likes')
    op.drop_index('ix_follows_user_id', table_name='follows')
    op.drop_index('ix_follows_following_id', table_name='follows')
    op.add_column('conversations', sa.Column('user2_id', sa.VARCHAR(length=50), autoincrement=False, nullable=True))
    op.add_column('conversations', sa.Column('user1_id', sa.VARCHAR(length=50), autoincrement=False, nullable=True))
    op.drop_constraint(None, 'conversations', type_='foreignkey')
    op.create_foreign_key('conversations_user2_id_fkey', 'conversations', 'users', ['user2_id'], ['user_id'])
    op.create_foreign_key('conversations_user1_id_fkey', 'conversations', 'users', ['user1_id'], ['user_id'])
    op.drop_index('ix_conversations_creator_id', table_name='conversations')
    op.create_unique_constraint('unique_conversation', 'conversations', ['user1_id', 'user2_id'])
    op.drop_column('conversations', 'deleted_at')
    op.drop_column('conversations', 'updated_at')
    op.drop_column('conversations', 'creator_id')
    op.drop_column('conversations', 'title')
    op.drop_index('ix_comments_user_id', table_name='comments')
    op.drop_index('ix_comments_post_id', table_name='comments')
    op.drop_table('deleted_messages')
    op.drop_index('ix_participants_user_id', table_name='participants')
    op.drop_index('ix_participants_conversation_id', table_name='participants')
    op.drop_table('participants')
    op.drop_table('deleted_conversations')
    message_type_enum = sa.Enum('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', name='messagetype')
    message_type_enum.drop(op.get_bind(), checkfirst=True)

    # ### end Alembic commands ###
