FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.25.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production APP_COOKIE_SECURE=true APP_COOKIE_SAME_SITE=strict
RUN corepack enable && corepack prepare pnpm@11.25.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/server-dist ./server-dist
RUN chown -R node:node /app
EXPOSE 3000
USER node
CMD ["node", "server-dist/server/main.js"]
