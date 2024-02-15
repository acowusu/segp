from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"msg": "Hello World"}

def test_generate_avatar():
    response = client.post(
            "/avatar/",
            headers = { 'Content-Type': 'application/json' },
            json = {
                    "driven_audio": "./examples/driven_audio/RD_Radio31_000.wavi",
                    "source_image": "./examples/source_image/art_18.png"
                    }
    )
    assert response.status_code == 200
