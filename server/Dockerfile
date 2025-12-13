FROM node:22-alpine
WORKDIR /app
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy schema FIRST so we can generate the client
COPY prisma ./prisma/

# Generate the client inside the container
RUN npx prisma generate

COPY . .
CMD ["npm", "run", "dev"]