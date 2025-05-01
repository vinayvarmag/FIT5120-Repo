# ---------- base image ----------
FROM python:3.10-slim

# ---------- system deps ----------
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
     portaudio19-dev \
      libportaudio2 \
      libsndfile1 \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ---------- python deps ----------
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ---------- copy source ----------
COPY . /app/

# ---------- run ----------
ENV PORT=8000
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
