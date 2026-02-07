FROM node:24-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Copy source code
COPY src ./src/
COPY tsconfig.json ./