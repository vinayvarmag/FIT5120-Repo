"""
backend/main.py - FastAPI + Socket.IO server
Auto-advances questions (10 s or all-answered) and streams scores.
"""
from __future__ import annotations
import logging, os, shutil, tempfile, asyncio, time
from asyncio import to_thread
from typing import Dict, Any
from uuid import uuid4

import socketio
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from games_core import generate_quiz, pronounce, preload_whisper

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
log = logging.getLogger("culture-api")

# --------------------------------------------------------------------------- #
# FastAPI - ordinary HTTP
# --------------------------------------------------------------------------- #
api = FastAPI(title="Cultural Games API")
api.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

@api.on_event("startup")
async def _warm():
    preload_whisper()

class QuizCreate(BaseModel):
    cats: list[str]
    n:   int

# In-memory state
SESSIONS: Dict[str, Dict[str, Any]] = {}
TEAM_BY_SID: Dict[str, tuple[str, str]] = {}          # sid -> (session_id, team_name)

# constants
PER_Q_SEC = 10

# --------------------------------------------------------------------------- #
# POST /quiz  ->  create session
# --------------------------------------------------------------------------- #
@api.post("/quiz")
async def create_quiz(req: QuizCreate):
    session_id = str(uuid4())
    qs         = await to_thread(generate_quiz, req.cats, req.n)
    SESSIONS[session_id] = {
        "status":    "lobby",
        "teams":     {},         # team_name -> score
        "questions": qs,
        "idx":       0,
        "answered":  {},         # team_name -> idx answered
        "deadline":  None,       # float | None - epoch seconds
        "task":      None        # asyncio.Task that advances when timer fires
    }
    return {"sessionId": session_id}

# --------------------------------------------------------------------------- #
# POST /pronounce - unchanged
# --------------------------------------------------------------------------- #
@api.post("/pronounce")
async def pronounce_ep(word: str = Form(...), wav: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        shutil.copyfileobj(wav.file, tmp)
        path = tmp.name
    res = await to_thread(pronounce, word, 2.0, path)
    os.unlink(path)
    return res

# --------------------------------------------------------------------------- #
# Socket.IO
# --------------------------------------------------------------------------- #
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*",
                           ping_interval=20, ping_timeout=10)
app = socketio.ASGIApp(sio, other_asgi_app=api)        # bind FastAPI + SIO

# Helpers
async def _broadcast(session_id: str):
    s = SESSIONS[session_id]
    await sio.emit("session_state", {
        "status":    s["status"],
        "idx":       s["idx"],
        "teams":     s["teams"],
        "questions": s["questions"],
        "deadline":  s["deadline"],
    }, room=session_id)

async def _schedule_advance(session_id: str):
    """
    Create / replace a background task that sleeps until deadline then flips.
    """
    s = SESSIONS[session_id]
    # cancel previous
    if t := s.get("task"):
        t.cancel()
    async def _wait():
        await asyncio.sleep(PER_Q_SEC)
        if s["status"] != "running":                       # ended meanwhile
            return
        await _advance(session_id)
    s["deadline"] = time.time() + PER_Q_SEC
    s["task"]     = asyncio.create_task(_wait())

async def _advance(session_id: str):
    s = SESSIONS[session_id]
    s["idx"]      += 1
    s["answered"]  = {}
    if s["idx"] >= len(s["questions"]):
        s["idx"]    = len(s["questions"]) - 1
        s["status"] = "ended"
        if t := s.get("task"): t.cancel()
        s["deadline"] = None
    else:
        await _schedule_advance(session_id)
    await _broadcast(session_id)

# Events
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
    """
    {sessionId, role: host|player, teamName?}
    """
    session_id = data["sessionId"]
    sess       = SESSIONS.get(session_id)
    if not sess:
        return await sio.emit("error_msg", {"msg": "Session not found"}, to=sid)

    await sio.enter_room(sid, session_id)

    if data["role"] == "player":
        team = (data.get("teamName") or "").strip()
        if not team:
            return await sio.emit("error_msg", {"msg": "Team name required"}, to=sid)
        sess["teams"][team] = 0
        TEAM_BY_SID[sid]   = (session_id, team)

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
    """
    {sessionId, choice:int}
    """
    session_id = data["sessionId"]
    sess       = SESSIONS.get(session_id)
    if not sess or sess["status"] != "running":
        return
    tb = TEAM_BY_SID.get(sid)
    if not tb or tb[0] != session_id:
        return

    team = tb[1]
    idx  = sess["idx"]
    if sess["answered"].get(team) == idx:
        return                                            # already answered

    if data["choice"] == sess["questions"][idx]["answer"]:
        sess["teams"][team] += 1
        correct = True
    else:
        correct = False
    sess["answered"][team] = idx
    await sio.emit("answer_result",
                   {"correct": correct, "score": sess["teams"][team]},
                   to=sid)

    # all teams done?
    if len(sess["answered"]) == len(sess["teams"]):
        await _advance(session_id)
    else:
        await _broadcast(session_id)
