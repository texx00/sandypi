"""Added incremental version column to the playlist table

Revision ID: 2f4ab5178ba3
Revises: c95d27ff17e3
Create Date: 2021-03-06 14:11:13.048822

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2f4ab5178ba3'
down_revision = 'c95d27ff17e3'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('playlists', schema=None) as batch_op:
        batch_op.add_column(sa.Column('version', sa.Integer(), default=0))
        batch_op.drop_column('active')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('playlists', schema=None) as batch_op:
        batch_op.add_column(sa.Column('active', sa.BOOLEAN(), nullable=True))
        batch_op.drop_column('version')

    # ### end Alembic commands ###