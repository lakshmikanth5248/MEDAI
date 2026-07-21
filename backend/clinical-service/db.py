from clinic_shared import make_engine, make_session_factory

import config

engine = make_engine(config.DATABASE_URL)
session = make_session_factory(engine)


def init_app(app):
    @app.teardown_appcontext
    def remove_session(exception=None):
        session.remove()
