FROM python:3.11-slim

WORKDIR /app

# Copy dependency file first
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code into container
COPY . .

# Set the default command to run the FastAPI development server
CMD ["fastapi", "dev", "main.py", "--host", "0.0.0.0"]