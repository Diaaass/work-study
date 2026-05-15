FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --prefer-offline --no-audit --no-fund

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "npx prisma db push && node prisma/seed.js && node prisma/seed-internships.js && node server.js"]
