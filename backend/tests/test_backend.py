from datetime import datetime
import unittest
from app import create_app, db
from flask_socketio import SocketIOTestClient
from flask_socketio import SocketIOTestClient

class BackendTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TESTING=True)
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        with self.app.app_context():
            db.create_all()
        self.client = self.app.test_client()

        # Register and login to get a token
        self.client.post('/auth/register', json={
            'username': 'testuser',
            'password': 'password123'
        })
        self.token = self.get_auth_token()

    def get_auth_token(self):
        res = self.client.post('/auth/login', json={
            'username': 'testuser',
            'password': 'password123'
        })
        self.assertEqual(res.status_code, 200)
        return res.json['access_token']

    def test_register_login(self):
        # Test user registration
        res = self.client.post('/auth/register', json={
            'username': 'newuser',
            'password': 'newpassword123'
        })
        self.assertEqual(res.status_code, 201)

        # Test user login
        res = self.client.post('/auth/login', json={
            'username': 'newuser',
            'password': 'newpassword123'
        })
        self.assertEqual(res.status_code, 200)

    def test_chat_list(self):
        # Test fetching chat list
        res = self.client.get('/chat/list', headers={'Authorization': f'Bearer {self.token}'})
        self.assertEqual(res.status_code, 200)

    def test_chat_history(self):
        # Test fetching chat history
        res = self.client.get('/chat/history/<partner_id>', headers={'Authorization': f'Bearer {self.token}'})
        self.assertEqual(res.status_code, 200)

    @pytest.mark.skip(reason="Skipping due to Polygon API rate limiting (429)")
    def test_get_monthly_data(self):
        symbol = "META"
        response = self.client.get(f'/stock/{symbol}/monthly')
        self.assertEqual(response.status_code, 200)


    def test_get_ticker_overview(self):
        # Test the /<string:symbol>/overview route
        symbol = "AAPL"
        response = self.client.get(f'/stock/{symbol}/overview')
        self.assertEqual(response.status_code, 200)
        self.assertIn("symbol", response.json)  # Expecting the response to include the symbol
        self.assertEqual(response.json["symbol"], symbol)


    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
