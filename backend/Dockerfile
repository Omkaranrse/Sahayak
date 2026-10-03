FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Supports either build context: repository root or backend/ directory
COPY backend/requirements.txt* requirements.txt* ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Move files to /app if build context was repository root
RUN if [ -d "./backend" ]; then cp -r ./backend/* ./; fi && chmod +x entrypoint.sh

EXPOSE 8000

CMD ["./entrypoint.sh"]
