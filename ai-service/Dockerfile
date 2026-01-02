FROM python:3.12-slim

WORKDIR /app

# Copy dependency file first
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code into container
COPY . .