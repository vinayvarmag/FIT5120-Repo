"""
backend/main.py - FastAPI + Socket.IO server
Auto-advances questions (10 s or all-answered) and streams scores.
"""

from __future__ import annotations

import asyncio
import logging
import os
import shutil
import tempfile
import time
from asyncio import to_thread
from typing import Any, Dict
from uuid import uuid4

import socketio
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from gtts import gTTS
from pydantic import BaseModel

from games_core import generate_quiz, pronounce, preload_whisper

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
log = logging.getLogger("culture-api")

# --------------------------------------------------------------------------- #
# FastAPI (inner app)
# --------------------------------------------------------------------------- #
api = FastAPI(title="Cultural Games API")

@api.on_event("startup")
async def _warm() -> None:
    """Load Whisper once (off-thread so we do not block the event loop)."""
    await to_thread(preload_whisper)

class QuizCreate(BaseModel):
    cats: list[str]
    n: int

# ------------------------------ in-memory state ----------------------------- #
SESSIONS: Dict[str, Dict[str, Any]] = {}
TEAM_BY_SID: Dict[str, tuple[str, str]] = {}
PER_Q_SEC = 20

# -------------------------------- endpoints -------------------------------- #
@api.post("/quiz")
async def create_quiz(req: QuizCreate):
    session_id = str(uuid4())
    qs = await to_thread(generate_quiz, req.cats, req.n)
    SESSIONS[session_id] = {
        "status": "lobby",
        "teams": {},
        "questions": qs,
        "idx": 0,
        "answered": {},
        "deadline": None,
        "task": None,
    }
    return {"sessionId": session_id}

@api.post("/pronounce")
async def pronounce_ep(word: str = Form(...), wav: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        shutil.copyfileobj(wav.file, tmp)
        path = tmp.name
    res = await to_thread(pronounce, word, 2.0, path)
    os.unlink(path)
    res["tts"] = f"/tts/{word}"
    return res

@api.get("/tts/{word}")
async def tts(word: str):
    cache_dir = "/tmp/tts-cache"
    os.makedirs(cache_dir, exist_ok=True)
    path = os.path.join(cache_dir, f"{word.lower()}.mp3")
    if not os.path.exists(path):
        gTTS(word, lang="en", slow=False).save(path)
    stat = os.stat(path)
    return FileResponse(
        path,
        media_type="audio/mpeg",
        filename=f"{word}.mp3",
        stat_result=stat,
        headers={
            "Cache-Control": "public, max-age=86400",
            "Accept-Ranges": "bytes",
            "Access-Control-Allow-Origin": "*",
        },
    )

# --------------------------------------------------------------------------- #
# Socket.IO wrapper
# --------------------------------------------------------------------------- #
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    ping_interval=20,
    ping_timeout=10,
)
app = socketio.ASGIApp(sio, other_asgi_app=api)

# outer CORS middleware (covers every response, incl. OPTIONS)
app = CORSMiddleware(
    app,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------- helper functions ------------------------------ #
async def _broadcast(session_id: str) -> None:
    s = SESSIONS[session_id]
    await sio.emit(
        "session_state",
        {
            "status": s["status"],
            "idx": s["idx"],
            "teams": s["teams"],
            "questions": s["questions"],
            "deadline": s["deadline"],
        },
        room=session_id,
    )

async def _schedule_advance(session_id: str) -> None:
    s = SESSIONS[session_id]
    if t := s.get("task"):
        t.cancel()

    async def _wait() -> None:
        await asyncio.sleep(PER_Q_SEC)
        if s["status"] == "running":
            await _advance(session_id)

    s["deadline"] = time.time() + PER_Q_SEC
    s["task"] = asyncio.create_task(_wait())

async def _advance(session_id: str) -> None:
    s = SESSIONS[session_id]
    s["idx"] += 1
    s["answered"] = {}
    if s["idx"] >= len(s["questions"]):
        s["idx"] = len(s["questions"]) - 1
        s["status"] = "ended"
        if t := s.get("task"):
            t.cancel()
        s["deadline"] = None
    else:
        await _schedule_advance(session_id)
    await _broadcast(session_id)

# ------------------------------ socket events ------------------------------ #
@sio.event
async def connect(sid, environ):
    log.info("socket %s connected", sid)

@sio.event
async def disconnect(sid):
    if sid in TEAM_BY_SID:
        session_id, team = TEAM_BY_SID.pop(sid)
        sess = SESSIONS.get(session_id)
        if sess and sess["status"] == "lobby":
            sess["teams"].pop(team, None)
            await _broadcast(session_id)
    log.info("socket %s disconnected", sid)

@sio.event
async def join_session(sid, data):
    session_id = data["sessionId"]
    sess = SESSIONS.get(session_id)
    if not sess:
        return await sio.emit("error_msg", {"msg": "Session not found"}, to=sid)

    await sio.enter_room(sid, session_id)

    if data["role"] == "player":
        team = (data.get("teamName") or "").strip()
        if not team:
            return await sio.emit("error_msg", {"msg": "Team name required"}, to=sid)
        sess["teams"][team] = 0
        TEAM_BY_SID[sid] = (session_id, team)

    await _broadcast(session_id)

@sio.event
async def start_quiz(sid, data):
    session_id = data["sessionId"]
    sess = SESSIONS.get(session_id)
    if sess:
        sess.update(idx=0, status="running", answered={})
        await _schedule_advance(session_id)
        await _broadcast(session_id)

@sio.event
async def answer(sid, data):
    session_id = data["sessionId"]
    sess = SESSIONS.get(session_id)
    if not sess or sess["status"] != "running":
        return
    tb = TEAM_BY_SID.get(sid)
    if not tb or tb[0] != session_id:
        return

    team = tb[1]
    idx = sess["idx"]
    if sess["answered"].get(team) == idx:
        return

    correct = data["choice"] == sess["questions"][idx]["answer"]
    if correct:
        sess["teams"][team] += 1
    sess["answered"][team] = idx

    await sio.emit(
        "answer_result",
        {"correct": correct, "score": sess["teams"][team]},
        to=sid,
    )

    if len(sess["answered"]) == len(sess["teams"]):
        await _advance(session_id)
    else:
        await _broadcast(session_id)
