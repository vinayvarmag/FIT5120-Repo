# ---------- base image ----------
FROM python:3.11-slim

# ---------- system-level deps ----------
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ffmpeg \
        libopenblas0-openmp \
        libomp5 \
        libsndfile1 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# ---------- python deps ----------
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    rm -rf /root/.cache

# ---------- copy source ----------
COPY . /app

# ---------- run ----------
ENV PYTHONUNBUFFERED=1 \
    PORT=8000
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
