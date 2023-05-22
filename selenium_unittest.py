import os
import unittest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from app import app, db

os.environ['DATABASE_URL'] = 'sqlite://'

class TestFlaskApp(unittest.TestCase):

    def setUp(self):
        self.app_context = app.app_context()
        self.app_context.push()
        self.app = app.test_client() # Flask provides a virtual test environment for testing our application
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        db.create_all()
        # Setup the Chrome driver options
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Ensure GUI is off
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")

        # Set the webdriver service
        webdriver_service = Service(ChromeDriverManager().install())

        # Setup the Selenium WebDriver
        self.driver = webdriver.Chrome(service=webdriver_service, options=chrome_options)

        # Configure the wait time for page loads
        self.wait = WebDriverWait(self.driver, 10)

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
        self.driver.quit()
    
    # Test that register user function works
    def test_register_user(self):
        
        self.driver.get("http://127.0.0.1:5001/register")
        self.driver.find_element(By.ID, "username-signup").click()
        self.driver.find_element(By.ID, "username-signup").send_keys("testuser1239")
        self.driver.find_element(By.ID, "password-signup").send_keys("testuser1239")
        self.driver.find_element(By.ID, "re-password-signup").send_keys("testuser1239")
        self.driver.find_element(By.CSS_SELECTOR, ".form-element:nth-child(5) #btn").click()
        # Wait for the message to appear (replace 'id_of_element' with the actual id of the element containing the message)
        message_element = WebDriverWait(self.driver, 20).until(EC.presence_of_element_located((By.ID, 'flash-message')))

        # Check that the message is correct
        self.assertEqual(message_element.text, 'Your account has been created! You are now able to log in.')
    
    # Test that login user function works
    def test_login_user(self):
        self.driver.get("http://127.0.0.1:5001/register")
        self.driver.find_element(By.ID, "username-signup").click()
        self.driver.find_element(By.ID, "username-signup").send_keys("testuser1239")
        self.driver.find_element(By.ID, "password-signup").send_keys("testuser1239")
        self.driver.find_element(By.ID, "re-password-signup").send_keys("testuser1239")
        self.driver.find_element(By.CSS_SELECTOR, ".form-element:nth-child(5) #btn").click()
        self.driver.get("http://127.0.0.1:5001/login")
        self.driver.find_element(By.CSS_SELECTOR, ".login-button").click()
        self.driver.find_element(By.ID, "username-login").click()
        self.driver.find_element(By.ID, "username-login").send_keys("testuser1239")
        self.driver.find_element(By.ID, "password-login").send_keys("testuser1239")
        self.driver.find_element(By.NAME, "submit").click()
        message_element = WebDriverWait(self.driver, 20).until(EC.presence_of_element_located((By.ID, 'flash-message')))
        self.assertEqual(message_element.text, 'Logged in successfully!')
    
    # Test that the register same username function works
    def test_register_same_username(self):
        self.driver.get("http://127.0.0.1:5001/register")
        self.driver.find_element(By.ID, "username-signup").click()
        self.driver.find_element(By.ID, "username-signup").send_keys("testuser1239")
        self.driver.find_element(By.ID, "password-signup").send_keys("testuser1239")
        self.driver.find_element(By.ID, "re-password-signup").send_keys("testuser1239")
        self.driver.find_element(By.CSS_SELECTOR, ".form-element:nth-child(5) #btn").click()

        self.driver.get("http://127.0.0.1:5001/register")
        self.driver.find_element(By.ID, "username-signup").click()
        self.driver.find_element(By.ID, "username-signup").send_keys("testuser1239")
        self.driver.find_element(By.ID, "password-signup").send_keys("testuser1239")
        self.driver.find_element(By.ID, "re-password-signup").send_keys("testuser1239")
        self.driver.find_element(By.CSS_SELECTOR, ".form-element:nth-child(5) #btn").click()

        message_element = WebDriverWait(self.driver, 20).until(EC.presence_of_element_located((By.ID, 'flash-message')))
        self.assertEqual(message_element.text, 'Username already exists. Please choose a different one.')

    # Test that the login wrong password function works
    def test_login_wrong_password(self):
        self.driver.get("http://127.0.0.1:5001/register")
        self.driver.find_element(By.ID, "username-signup").click()
        self.driver.find_element(By.ID, "username-signup").send_keys("testuser1239")
        self.driver.find_element(By.ID, "password-signup").send_keys("testuser1239")
        self.driver.find_element(By.ID, "re-password-signup").send_keys("testuser1239")
        self.driver.find_element(By.CSS_SELECTOR, ".form-element:nth-child(5) #btn").click()

        self.driver.get("http://127.0.0.1:5001/login")
        self.driver.find_element(By.CSS_SELECTOR, ".login-button").click()
        self.driver.find_element(By.ID, "username-login").click()
        self.driver.find_element(By.ID, "username-login").send_keys("testuser1239")
        self.driver.find_element(By.ID, "password-login").send_keys("testuser1239")
        self.driver.find_element(By.NAME, "submit").click()
        message_element = WebDriverWait(self.driver, 20).until(EC.presence_of_element_located((By.ID, 'flash-message')))
        self.assertEqual(message_element.text, 'Invalid username or password.')

    # Test that the login nonexistent user function works
    def test_login_nonexistent_user(self):
        self.driver.get("http://127.0.0.1:5001/login")
        self.driver.find_element(By.CSS_SELECTOR, ".login-button").click()
        self.driver.find_element(By.ID, "username-login").click()
        self.driver.find_element(By.ID, "username-login").send_keys("testuser1123236")
        self.driver.find_element(By.ID, "password-login").send_keys("testuser1234")
        self.driver.find_element(By.NAME, "submit").click()
        message_element = WebDriverWait(self.driver, 20).until(EC.presence_of_element_located((By.ID, 'flash-message')))
        self.assertEqual(message_element.text, 'Invalid username or password.')

if __name__ == "__main__":
    unittest.main()
