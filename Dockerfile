FROM node:22-alpine

WORKDIR /app

# The Node base image bundles an older npm whose nested sigstore package
# is vulnerable to CVE-2026-48815. Pin npm to a release carrying sigstore 4.1.1.
RUN npm install --global npm@11.21.1 \
    && npm cache clean --force \
    && node -p "require('/usr/local/lib/node_modules/npm/node_modules/sigstore/package.json').version"

COPY package*.json ./

RUN npm ci --omit=dev

COPY app.js ./

EXPOSE 3000

CMD ["npm", "start"]
