# Frontend image for estima.sk (Next.js 14). Single stage: npm ci installs
# devDeps (needed by `next build`), the build bakes NEXT_PUBLIC_* from
# .env.production, and the runtime serves next start bound to loopback so only
# the host's nginx can reach it.
FROM node:22-bookworm
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npx","next","start","-H","127.0.0.1","-p","3000"]
