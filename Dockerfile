# =========================
# 1) Build Frontend (Vite)
# =========================
FROM node:20-slim AS frontend-build
WORKDIR /app

# Dépendances
COPY package*.json ./
RUN npm ci

# Code front + config Vite
COPY src ./src
COPY public ./public
COPY index.html ./
COPY vite.config.* ./
COPY tsconfig*.json ./
COPY postcss.config.* ./
COPY tailwind.config.* ./

# Build => crée /app/dist
RUN npm run build


# =========================
# 2) Backend (FastAPI)
# =========================
FROM python:3.12-slim AS backend
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
 && rm -rf /var/lib/apt/lists/*

# Backend
COPY engine ./engine
RUN pip install --no-cache-dir -r engine/requirements.txt

# Front build
COPY --from=frontend-build /app/dist ./dist

# Data runtime (ton loader lit src/data/mythology_data.json)
COPY src/data ./src/data

# Dossier images générées
RUN mkdir -p /app/public/generated_images

EXPOSE 7860

WORKDIR /app/engine
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "7860"]

