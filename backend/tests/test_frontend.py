from ssl import Options
import subprocess
import pytest
from app import create_app, db
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import unittest
import time

@pytest.fixture(scope="session", autouse=True)
def start_services():
    """
    Automatically start frontend and backend services before running tests.
    """
    # Start the frontend service
    frontend_process = subprocess.Popen(
        ["python", "-m", "http.server", "8889"],
        cwd="../frontend",  # Adjust the path to your frontend directory
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    print("Frontend service started on http://127.0.0.1:8889")

    # Wait for services to start
    time.sleep(5)

    yield  # Run the tests

    # Terminate the services after tests
    frontend_process.terminate()
    print("Services terminated.")

class FrontendTestCase(unittest.TestCase):
    def setUp(self):
        options = webdriver.ChromeOptions()
        options.add_argument("--headless=new")  # Run in headless mode
        self.driver = webdriver.Chrome(options=options)
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

    def test_page_title(self):
        self.driver.get("http://127.0.0.1:8889/ticker.html")
        self.assertEqual(self.driver.title, "Investment Dashboard")

    def test_tab_exists(self):
        self.driver.get("http://127.0.0.1:8889/ticker.html")
        tab = self.driver.find_element(By.CLASS_NAME, "tab")
        self.assertIsNotNone(tab)

    def test_menu_exists(self):
        self.driver.get("http://127.0.0.1:8889/ticker.html")
        menu = self.driver.find_element(By.CLASS_NAME, "menu-item")
        self.assertIsNotNone(menu)

    def test_trade_exists(self):
        self.driver.get("http://127.0.0.1:8889/ticker.html")
        trade = self.driver.find_element(By.CLASS_NAME, "trading-interface-section")
        self.assertIsNotNone(trade)

    def test_timeframe_exists(self):
        self.driver.get("http://127.0.0.1:8889/ticker.html")
        timeframe = self.driver.find_element(By.CLASS_NAME, "timeframe-btn")
        self.assertIsNotNone(timeframe)
    def test_toprank_page_loads(self):
        self.driver.get("http://127.0.0.1:8889/toprank.html")
        self.assertIn("Top Investors", self.driver.page_source)
    
    def test_profile_pictures_visible(self):
        self.driver.get("http://127.0.0.1:8889/toprank.html")
        images = self.driver.find_elements(By.CLASS_NAME, "profile-img")
        for img in images:
            self.assertTrue(img.get_attribute("src").endswith(".jpg") or img.get_attribute("src").endswith(".png"))
    
    def test_usernames_present(self):
        self.driver.get("http://127.0.0.1:8889/toprank.html")
        names = self.driver.find_elements(By.CLASS_NAME, "user-name")
        self.assertGreater(len(names), 0)
        for name in names:
            self.assertNotEqual(name.text.strip(), "")
    
    def test_send_message_button_click(self):
        self.driver.get("http://127.0.0.1:8889/toprank.html")
        buttons = self.driver.find_elements(By.CLASS_NAME, "send-message-btn")
        self.assertGreater(len(buttons), 0)
        buttons[0].click()
        time.sleep(1)  # If a modal or alert appears

    def tearDown(self):
        self.driver.quit()