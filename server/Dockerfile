FROM node:24-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client at build time
RUN npx prisma generate

# Copy the rest of the application
COPY . .