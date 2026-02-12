FROM node:24-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy the prisma folder (needed for postinstall to work properly)
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .