FROM node:14.5.0-alpine

# Create app dir
RUN mkdir -p /usr/local/app
WORKDIR /usr/local/app

# Copy over dist and package jsons
COPY ./dist ./dist
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

# Remove dev dependencies
COPY ./node_modules ./node_modules
RUN npm prune --production

ENTRYPOINT ["node", "./dist/index.js"]