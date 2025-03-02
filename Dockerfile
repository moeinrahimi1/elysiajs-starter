# Use the official Bun image
FROM oven/bun:1.2.2 AS base
WORKDIR /app

# Install dependencies and build the application
FROM base AS build
COPY package.json ./
RUN bun install --production
COPY . .
RUN bun run build

# Create the production image
FROM base AS release
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build

ARG NODE_ENV
ARG PORT
ARG SOCKET_PORT

ENV TZ=Asia/Tehran
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
ENV SOCKET_PORT=${SOCKET_PORT}

EXPOSE ${PORT}
EXPOSE ${SOCKET_PORT}

CMD ["bun", "run", "production"]