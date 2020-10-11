"""Test delete column

Revision ID: 93b82959c10d
Revises: bf3bbfa3c751
Create Date: 2020-10-11 16:26:02.361302

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '93b82959c10d'
down_revision = 'bf3bbfa3c751'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('playlists', schema=None) as batch_op:
        batch_op.add_column(sa.Column('active', sa.Boolean(), nullable=True))
        batch_op.drop_column('elements')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('playlists', schema=None) as batch_op:
        batch_op.add_column(sa.Column('elements', sa.VARCHAR(length=1000), nullable=True))
        batch_op.drop_column('active')

    # ### end Alembic commands ###