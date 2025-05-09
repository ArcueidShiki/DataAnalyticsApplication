import unittest
from app import create_app, db
from flask import json

class AuthTestCase(unittest.TestCase):
    # tests/unit_test.py
    def setUp(self):
        self.app = create_app(TESTING=True)
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite

    def test_register_login(self):
        res = self.client.post('/auth/register', json={
            'username': 'unittest',
            'password': '123456'
        })
        self.assertEqual(res.status_code, 201)

        res = self.client.post('/auth/login', json={
            'username': 'unittest',
            'password': '123456'
        })
        self.assertEqual(res.status_code, 200)

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
        return super().tearDown()

if __name__ == '__main__':
    unittest.main()
