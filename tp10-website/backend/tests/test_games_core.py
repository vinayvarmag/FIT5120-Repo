"""
Unit tests for generate_quiz() in games_core.py
# all Groq/Whisper calls are mocked, nothing heavy is loaded.
"""
import types
import json
import importlib
from unittest import mock
import os 
import pytest
os.environ.setdefault("GROQ_API_KEY", "dummy")
# -------------------------------------------------------------------
# helper: craft a fake Groq client that returns a canned JSON payload
# -------------------------------------------------------------------
_FAKE_JSON = '[{"question":"Q","options":["a","b","c","d"],"answer":0}]'

class _DummyGroqResp:
    """Mimics groq.chat.completions.create(...) return value."""
    def __init__(self, txt):
        msg = types.SimpleNamespace(content=txt)
        self.choices = [types.SimpleNamespace(message=msg)]

def _fake_create(**_kwargs):
    return _DummyGroqResp(_FAKE_JSON)

@pytest.fixture(autouse=True)
def _patch_groq(monkeypatch):
    """
    * forces a dummy GROQ_API_KEY env-var
    * replaces games_core.client.chat.completions.create with fake
    * no need to import real groq SDK
    """
    monkeypatch.setenv("GROQ_API_KEY", "dummy")

    from backend import games_core
    # stub whisper preload to avoid 150 MB download
    monkeypatch.setattr(games_core, "preload_whisper", lambda: None, raising=False)

    # stub Groq client behaviour
    dummy_client = types.SimpleNamespace(
        chat=types.SimpleNamespace(
            completions=types.SimpleNamespace(create=_fake_create)
        )
    )
    monkeypatch.setattr(games_core, "client", dummy_client, raising=False)

def test_generate_quiz_parses_json():
    from backend import games_core
    quiz = games_core.generate_quiz(["flags"], 1)
    assert isinstance(quiz, list)
    assert quiz[0]["answer"] == 0
