# Stage 1: Dependensi
FROM node:20-alpine AS deps
WORKDIR /app

# Salin file package.json dan package-lock.json (jika ada)
COPY package.json ./
# Instal dependensi
RUN npm install

# Stage 2: Pembangun
FROM node:20-alpine AS builder
WORKDIR /app
# Salin dependensi dari stage sebelumnya
COPY --from=deps /app/node_modules ./node_modules
# Salin sisa kode aplikasi
COPY . .

# Bangun aplikasi Next.js untuk produksi
RUN npm run build

# Stage 3: Produksi
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Salin folder .next yang sudah dibangun dari stage builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Perintah untuk menjalankan aplikasi
CMD ["npm", "start"]
