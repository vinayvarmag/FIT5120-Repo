# ---------- base image ----------
FROM python:3.11-slim               

# ---------- system deps ----------
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ffmpeg \               
        libsndfile1 &&         
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ---------- python deps ----------
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ---------- copy source ----------
COPY backend/ /app/backend

# ---------- run ----------
ENV PYTHONUNBUFFERED=1 \
    TRANSFORMERS_CACHE=/tmp/transformers \
    PORT=8000
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
