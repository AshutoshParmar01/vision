FROM python:3.12-slim

# Install Node.js 22 (supabase-js requires >=22) + runtime libs for opencv-python wheels.
# NOTE: intentionally NOT installing libopencv-dev (400+ packages, very slow).
# opencv-python ships prebuilt wheels; it only needs libGL + libglib at runtime.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl gnupg ca-certificates \
    libgl1 libglib2.0-0 \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Node deps first (better layer caching)
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Python deps: copy code first, then create venv + install (with retries for flaky DNS)
COPY python/ ./python/
RUN python3 -m venv /app/python/venv \
    && /app/python/venv/bin/pip install --no-cache-dir --retries 10 --timeout 60 -r python/requirements.txt

# Server code
COPY server/ ./server/

ENV PORT=5000
ENV PYTHON_PATH=/app/python/venv/bin/python
WORKDIR /app/server
EXPOSE 5000

CMD ["node", "index.js"]
