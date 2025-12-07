FROM node:24-bookworm-slim

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npm run prisma:generate
RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && node dist/main.js"]
