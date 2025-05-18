# ---------- base image ----------
FROM python:3.11-slim
 
# ---------- system-level deps ----------
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ffmpeg \ 
        libgomp1 \
        libsndfile1 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
 
# ---------- python deps ----------
WORKDIR /app
COPY requirements.txt .
# explicit CPU wheel so pip doesn’t pull the 1-GB CUDA variant
RUN pip install --no-cache-dir torch==2.2.2+cpu \
      --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt && \
    rm -rf /root/.cache
 
# ---------- copy source ----------
COPY . /app
 
# ---------- run ----------
ENV PYTHONUNBUFFERED=1 \
    TRANSFORMERS_CACHE=/tmp/transformers \
    PORT=8000
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
