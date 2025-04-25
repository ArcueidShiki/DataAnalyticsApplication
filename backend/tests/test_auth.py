from flask import json

def test_register_and_login(client):
    # Test registration
    response = client.post('/auth/register', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    assert response.status_code == 201

    # Test login with correct credentials
    response = client.post('/auth/login', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    assert response.status_code == 200

    # Test login with right password
    response = client.post('/auth/login', json={
        'username': 'testuser',
        'password': 'wrongpass'
    })
    assert response.status_code == 401 or response.status_code == 400
