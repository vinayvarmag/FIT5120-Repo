#!/usr/bin/env python3
"""
Logic for Cultural Games – CLI + importable.
Switched to faster-whisper (tiny-int8, ~45 MB) for low-RAM deployments.
"""
from __future__ import annotations

import argparse, json, logging, sys, time, tempfile, os
from typing import List, Optional, Tuple

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
log = logging.getLogger("culture-games")

# ---------- Groq ---------- #
try:
    from groq import Groq
except ImportError:
    log.error("groq SDK missing; pip install groq")
    sys.exit(1)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY env-var is missing")

client     = Groq(api_key=GROQ_API_KEY)
GROQ_MODEL = "llama3-8b-8192"

# ---------- faster-whisper preload ---------- #
_WHIP: "WhisperModel | None" = None     # cached model

def preload_whisper() -> None:
    """
    Loads tiny-int8 model once and keeps it in RAM (~45 MB).
    """
    global _WHIP
    if _WHIP is None:
        log.info("Loading faster-whisper tiny-int8 …")
        from faster_whisper import WhisperModel
        _WHIP = WhisperModel(
            "guillaumekln/faster-whisper-tiny.en",
            device="cpu",
            compute_type="int8"
        )

preload_whisper()

# ---------- Quiz ---------- #
def _prompt(categories: List[str], n: int) -> str:
    cats = ", ".join(categories)
    return (
        f"Generate {n} cultural quiz questions as a JSON array.\n"
        '{ "question":"...", "options":["A","B","C","D"], "answer":0 }\n'
        f"Categories: {cats}\n"
        "Rules:\n"
        "- Real cultural facts only\n"
        "- Exactly 4 options\n"
        "- answer is 0-based index of correct option\n"
        "- Output ONLY the JSON array"
    )

def generate_quiz(cats: List[str], n: int):
    prompt = _prompt(cats, n)
    resp   = client.chat.completions.create(
        model       = GROQ_MODEL,
        messages    = [{"role": "user", "content": prompt}],
        temperature = 0.3,
        max_tokens  = 1024,
    )
    txt = resp.choices[0].message.content.strip()
    s, e = txt.find("["), txt.rfind("]")
    if s == -1 or e == -1:
        raise RuntimeError("Groq did not return JSON array")
    return json.loads(txt[s : e + 1])

# ---------- Pronunciation ---------- #
def _decode_with_pydub(path: str):
    """
    Decode any ffmpeg-supported file with pydub.
    Returns mono float32 @16 kHz as numpy array.
    """
    from pydub import AudioSegment
    import numpy as np

    seg = AudioSegment.from_file(path)
    seg = seg.set_frame_rate(16000).set_channels(1)
    scale = float(1 << (8 * seg.sample_width - 1))    # 32768 for 16-bit
    samples = np.array(seg.get_array_of_samples()).astype("float32") / scale
    return samples, 16000

def pronounce(word: str, sec: float, wav_path: Optional[str]):
    """
    Score a recording. wav_path must be provided in server mode.
    Accepts WAV or browser WebM/Opus.  Uses faster-whisper (tiny-int8).
    """
    import soundfile as sf
    import numpy as np
    import phonetics
    from rapidfuzz.distance import Levenshtein

    if wav_path is None:
        raise RuntimeError("Server mode: wav_path must be provided")

    # 1) try soundfile (fast, native formats)
    try:
        audio, sr = sf.read(wav_path, dtype="float32")
    except Exception:
        audio = None
        sr    = None

    # 2) pydub fallback or re-read if not 16 kHz
    if audio is None or sr != 16000:
        audio, sr = _decode_with_pydub(wav_path)   # always returns 16 kHz

    if audio.ndim > 1:
        audio = audio.mean(axis=1)                 # mono

    # ---------- STT ---------- #
    model = _WHIP                                  # type: ignore
    segments, _info = model.transcribe(
        audio,
        beam_size=1,
        vad_filter=True,
        language="en",
    )
    hyp = " ".join(seg.text for seg in segments).lower().strip()

    # ---------- scoring ---------- #
    score = 1 - Levenshtein.normalized_distance(
        phonetics.metaphone(word.lower()),
        phonetics.metaphone(hyp)
    )

    return {
        "target":     word,
        "transcript": hyp,
        "score":      round(score, 3),
        "pass":       score >= 0.7,
    }

# ---------- CLI entry-point ---------- #
def _cli():
    p   = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)

    q  = sub.add_parser("quiz")
    q.add_argument("--cats", nargs="+",
                   choices=["flags", "food", "fest"],
                   default=["flags"])
    q.add_argument("--n", type=int, default=3)

    pr = sub.add_parser("pronounce")
    pr.add_argument("word")
    pr.add_argument("--sec", type=float, default=2.0)
    pr.add_argument("--wav")

    args = p.parse_args()
    if args.cmd == "quiz":
        print(json.dumps(generate_quiz(args.cats, args.n), indent=2))
    else:
        print(json.dumps(pronounce(args.word, args.sec, args.wav), indent=2))

if __name__ == "__main__":
    _cli()
