FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

# npm is needed to install production dependencies, but not to run the app.
# Remove the bundled CLI and its dependency tree from the final runtime image.
RUN npm ci --omit=dev \
    && npm cache clean --force \
    && rm -rf /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx

COPY app.js ./

EXPOSE 3000

CMD ["node", "app.js"]
