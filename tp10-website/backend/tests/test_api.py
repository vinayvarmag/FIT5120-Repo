"""
Smoke-tests the FastAPI routes in backend/main.py

* /quiz      -> returns {"sessionId": "..."}
* /pronounce -> returns dummy JSON from the mocked pronounce()
"""
from fastapi.testclient import TestClient
import types

import pytest
import os
os.environ.setdefault("GROQ_API_KEY", "dummy")
# -------------------------------------------------------------------
# patch games_core functions before importing main.py
# -------------------------------------------------------------------
@pytest.fixture(autouse=True)
def _patch_games_core(monkeypatch):
    from backend import games_core

    # stub generate_quiz()
    def _fake_quiz(cats, n):
        return [{"question": "Q", "options": ["a", "b", "c", "d"], "answer": 0}]
    monkeypatch.setattr(games_core, "generate_quiz", _fake_quiz)

    # stub pronounce()
    def _fake_pron(word, sec, wav_path):
        return {"target": word, "transcript": word, "score": 1.0, "pass": True}
    monkeypatch.setattr(games_core, "pronounce", _fake_pron)

    # no whisper load
    monkeypatch.setattr(games_core, "preload_whisper", lambda: None, raising=False)

    yield  # run the tests

def test_quiz_endpoint():
    from backend import main  # import *after* patches
    client = TestClient(main.app)

    resp = client.post("/quiz", json={"cats": ["flags"], "n": 1})
    assert resp.status_code == 200
    assert "sessionId" in resp.json()

def test_pronounce_endpoint(tmp_path):
    from backend import main
    client = TestClient(main.app)

    dummy_wav = tmp_path / "a.wav"
    dummy_wav.write_bytes(b"RIFFxxxx")  # fake file content

    resp = client.post(
        "/pronounce",
        data={"word": "test"},
        files={"wav": ("a.wav", dummy_wav.read_bytes(), "audio/wav")},
    )
    data = resp.json()
    assert resp.status_code == 200
    assert data["pass"] is True
