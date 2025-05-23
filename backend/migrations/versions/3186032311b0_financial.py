"""Financial

Revision ID: 3186032311b0
Revises: 04f6033ae4ee
Create Date: 2025-05-16 15:56:26.309141

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3186032311b0'
down_revision = '04f6033ae4ee'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('financials', schema=None) as batch_op:
        batch_op.add_column(sa.Column('cik', sa.String(length=20), nullable=True))
        batch_op.add_column(sa.Column('symbol', sa.String(length=20), nullable=False))
        batch_op.add_column(sa.Column('type', sa.String(length=10), nullable=False))
        batch_op.add_column(sa.Column('sub_type', sa.String(length=10), nullable=False))
        batch_op.add_column(sa.Column('value', sa.Integer(), nullable=False))
        batch_op.add_column(sa.Column('unit', sa.String(length=10), nullable=True))
        batch_op.add_column(sa.Column('labal', sa.String(length=100), nullable=False))
        batch_op.add_column(sa.Column('order', sa.Integer(), nullable=False))
        batch_op.create_unique_constraint('unique_financials', ['company_id', 'fiscal_year', 'fiscal_period', 'type', 'sub_type'])
        batch_op.create_foreign_key('fk_financials_symbol', 'us_stocks', ['symbol'], ['symbol'])
        batch_op.drop_column('revenues')
        batch_op.drop_column('net_income')
        batch_op.drop_column('net_cash_flow')
        batch_op.drop_column('total_liabilities')
        batch_op.drop_column('noncurrent_liabilities')
        batch_op.drop_column('source_filing_url')
        batch_op.drop_column('filing_date')
        batch_op.drop_column('current_liabilities')
        batch_op.drop_column('operating_income')
        batch_op.drop_column('noncurrent_assets')
        batch_op.drop_column('total_equity')
        batch_op.drop_column('total_assets')
        batch_op.drop_column('current_assets')
        batch_op.drop_column('gross_profit')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('financials', schema=None) as batch_op:
        batch_op.add_column(sa.Column('gross_profit', sa.FLOAT(), nullable=True))
        batch_op.add_column(sa.Column('current_assets', sa.FLOAT(), nullable=True))
        batch_op.add_column(sa.Column('total_assets', sa.FLOAT(), nullable=True))
        batch_op.add_column(sa.Column('total_equity', sa.FLOAT(), nullable=True))
        batch_op.add_column(sa.Column('noncurrent_assets', sa.FLOAT(), nullable=True))
        batch_op.add_column(sa.Column('operating_income', sa.FLOAT(), nullable=True))
        batch_op.add_column(sa.Column('current_liabilities', sa.FLOAT(), nullable=True))
        batch_op.add_column(sa.Column('filing_date', sa.DATE(), nullable=False))
        batch_op.add_column(sa.Column('source_filing_url', sa.VARCHAR(), nullable=True))
        batch_op.add_column(sa.Column('noncurrent_liabilities', sa.FLOAT(), nullable=True))
        batch_op.add_column(sa.Column('total_liabilities', sa.FLOAT(), nullable=True))
        batch_op.add_column(sa.Column('net_cash_flow', sa.FLOAT(), nullable=True))
        batch_op.add_column(sa.Column('net_income', sa.FLOAT(), nullable=True))
        batch_op.add_column(sa.Column('revenues', sa.FLOAT(), nullable=True))
        batch_op.drop_constraint('fk_financials_symbol', type_='foreignkey')
        batch_op.drop_constraint('unique_financials', type_='unique')
        batch_op.drop_column('order')
        batch_op.drop_column('labal')
        batch_op.drop_column('unit')
        batch_op.drop_column('value')
        batch_op.drop_column('sub_type')
        batch_op.drop_column('type')
        batch_op.drop_column('symbol')
        batch_op.drop_column('cik')

    # ### end Alembic commands ###
