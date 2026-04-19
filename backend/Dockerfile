FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --prefer-offline --no-audit --no-fund

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && node prisma/seed-internships.js && node server.js"]
