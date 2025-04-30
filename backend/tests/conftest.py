import sys
import os
import pytest
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app')))
from app import create_app, db

@pytest.fixture
def app():
    app = create_app(TESTING=True)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client():
    app = create_app(TESTING=True)
    with app.app_context():
        db.create_all()
    with app.test_client() as client:
        yield client
        db.session.remove()
