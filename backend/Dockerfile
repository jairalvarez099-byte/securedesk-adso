FROM node:20-bookworm-slim
WORKDIR /app
# postgresql-client-16 desde el repositorio oficial PGDG: la version de pg_dump
# debe coincidir con el servidor postgres:16 del docker-compose.yml
# (el paquete de Debian bookworm trae pg_dump 15 y el backup falla).
RUN apt-get update \
 && apt-get install -y \
 --no-install-recommends \
 curl \
 ca-certificates \
 && install -d /usr/share/postgresql-common/pgdg \
 && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
 -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
 && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] http://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" \
 > /etc/apt/sources.list.d/pgdg.list \
 && apt-get update \
 && apt-get install -y \
 --no-install-recommends \
 postgresql-client-16 \
 && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src
COPY scripts ./scripts
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate
EXPOSE 3000
CMD [ "sh", "-c", "npx prisma migrate deploy && npm start" ]
