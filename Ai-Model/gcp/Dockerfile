FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

COPY requirement.txt .
RUN pip install --no-cache-dir -r requirement.txt

COPY . .

EXPOSE 8080

CMD ["sh", "-c", "uvicorn loadModel:app --host 0.0.0.0 --port ${PORT}"]
