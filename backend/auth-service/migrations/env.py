from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine, pool

import config as service_config
from models import Base

SERVICE_SCHEMA = "clinic_auth"

alembic_config = context.config
if alembic_config.config_file_name is not None:
    fileConfig(alembic_config.config_file_name)

target_metadata = Base.metadata

# NOTE: deliberately NOT using alembic_config.set_main_option("sqlalchemy.url", ...)
# here - configparser (which backs alembic.ini) treats "%" as its own
# interpolation escape character, and a URL-encoded password (e.g. "%40" for
# a literal "@") breaks it. The URL is passed directly to SQLAlchemy instead,
# bypassing configparser interpolation entirely.


def include_object(object_, name, type_, reflected, compare_to):
    """Only ever manage this service's own schema, even though Postgres
    reflects every schema in the shared Supabase database (cross-schema FKs
    make other schemas' tables visible to reflection).
    """
    schema = getattr(object_, "schema", None)
    if type_ == "table":
        return schema == SERVICE_SCHEMA
    return True


def run_migrations_offline():
    context.configure(
        url=service_config.DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        version_table_schema=SERVICE_SCHEMA,
        include_schemas=True,
        include_object=include_object,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = create_engine(service_config.DATABASE_URL, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            version_table_schema=SERVICE_SCHEMA,
            include_schemas=True,
            include_object=include_object,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
