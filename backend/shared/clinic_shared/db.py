"""Plain SQLAlchemy (not Flask-SQLAlchemy) engine/session helpers, shared so
every service wires up its database connection the same way. Each service
still owns its own declarative Base and models - only the engine/session
plumbing is shared.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker


def make_engine(database_url, **kwargs):
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set")
    kwargs.setdefault("pool_pre_ping", True)
    kwargs.setdefault("pool_size", 5)
    kwargs.setdefault("max_overflow", 5)
    return create_engine(database_url, **kwargs)


def make_session_factory(engine):
    return scoped_session(sessionmaker(bind=engine, autoflush=False, autocommit=False))


def teardown_session(session):
    """Call from a Flask `teardown_appcontext` handler."""

    def _teardown(exception=None):
        session.remove()

    return _teardown
