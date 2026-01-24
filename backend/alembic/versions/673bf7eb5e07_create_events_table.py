"""create_events_table

Revision ID: 673bf7eb5e07
Revises: 
Create Date: 2024-07-25 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid

# revision identifiers, used by Alembic.
revision: str = '673bf7eb5e07'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### Create the events table with the sacred schema ###
    op.create_table('events',
        sa.Column('event_id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('action_type', sa.String(), nullable=False),
        sa.Column('context', JSONB(), nullable=False),
        sa.Column('decision', sa.String(), nullable=False),
        sa.Column('policy_version', sa.Integer(), nullable=True),
        sa.Column('policy_id', sa.String(), nullable=True),
        sa.Column('ai_advice', JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False)
    )
    
    # ### Create the immutable trigger function ###
    op.execute("""
        CREATE OR REPLACE FUNCTION prevent_update_delete()
        RETURNS TRIGGER AS $$
        BEGIN
            RAISE EXCEPTION 'This table is immutable. UPDATE and DELETE operations are forbidden.';
        END;
        $$ LANGUAGE plpgsql;
    """)
    
    # ### Apply the trigger to the events table ###
    op.execute("""
        CREATE TRIGGER events_immutable_trigger
        BEFORE UPDATE OR DELETE ON events
        FOR EACH ROW EXECUTE FUNCTION prevent_update_delete();
    """)


def downgrade() -> None:
    # ### Remove the trigger and the table ###
    op.execute("DROP TRIGGER IF EXISTS events_immutable_trigger ON events;")
    op.execute("DROP FUNCTION IF EXISTS prevent_update_delete();")
    op.drop_table('events')
