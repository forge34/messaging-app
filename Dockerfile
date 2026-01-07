FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

CMD ["sh", "-c", "npx prisma db push && npm run dev"]
