FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run seed script on startup (optional, or run manually)
# CMD ["sh", "-c", "python seed.py && uvicorn main:app --host 0.0.0.0 --port $PORT"]

# For Render, PORT is provided by env
CMD ["sh", "-c", "python seed.py && uvicorn main:app --host 0.0.0.0 --port 8000"]
