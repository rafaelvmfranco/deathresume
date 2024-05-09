FROM node:18.20.2-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app
RUN npm install -g pnpm@8.11.0

COPY . .
RUN ls

RUN pnpm install --production
RUN pnpm build:server


FROM node:18.20.2-alpine AS runner

WORKDIR /app
COPY --from=builder /app/dist/apps/server ./dist
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE $PORT

CMD ["node", "dist/main.js"]