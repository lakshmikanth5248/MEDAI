"""baseline - schema already created by backend/sql/schema.sql

This revision intentionally does nothing. Run backend/sql/schema.sql against
Supabase first, then run `alembic stamp head` (see backend/migrate-all.ps1
-Stamp) to mark this revision as applied without re-running any DDL. Write
real migrations on top of this baseline for future schema changes.

Revision ID: 0001
Revises:
Create Date: 2026-07-16

"""
revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
