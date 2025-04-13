import unittest
from app import create_app, db


class BasicTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_post_item(self):
        res = self.client.post("/", json={"name": "UnitTest"})
        self.assertEqual(res.status_code, 404)
        # self.assertIn("UnitTest", res.get_data(as_text=True))
