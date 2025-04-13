def test_get_user(client):
    response = client.get("/users/")
    assert response.status_code == 404
