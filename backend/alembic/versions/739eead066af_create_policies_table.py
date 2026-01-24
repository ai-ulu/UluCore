"""create_policies_table

Revision ID: 739eead066af
Revises: 673bf7eb5e07
Create Date: 2024-07-25 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

# revision identifiers, used by Alembic.
revision: str = '739eead066af'
down_revision: Union[str, None] = '673bf7eb5e07'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('policies',
        sa.Column('policy_id', sa.String(), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('policy_data', JSONB(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('policy_id', 'version')
    )
    op.create_index(op.f('ix_policies_policy_id_is_active'), 'policies', ['policy_id', 'is_active'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_policies_policy_id_is_active'), table_name='policies')
    op.drop_table('policies')
