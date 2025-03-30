import logging
from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model

# Configurar el logger
logger = logging.getLogger(__name__)

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.user_data = {
            'email': 'test@example.com',
            'username': 'testuser',
            'password': 'testpass123',
            'password2': 'testpass123',
            'user_type': 'client',
            'phone_number': '123456789'
        }
        logger.info('Test setup completed')

    def test_user_registration(self):
        logger.info('Starting registration test')
        response = self.client.post(self.register_url, self.user_data, format='json')
        logger.debug(f'Registration response: {response.data}')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue('access' in response.data)
        self.assertTrue('refresh' in response.data)
        logger.info('Registration test completed successfully')

    def test_user_login(self):
        logger.info('Starting login test')
        # First create a user
        self.client.post(self.register_url, self.user_data, format='json')
        
        # Then try to login
        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        logger.debug(f'Attempting login with: {login_data["email"]}')
        response = self.client.post(self.login_url, login_data, format='json')
        logger.debug(f'Login response: {response.data}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('access' in response.data)
        logger.info('Login test completed successfully')