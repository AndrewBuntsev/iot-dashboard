FROM node:20.12.0-alpine

# Install dependencies for packages that require node-gyp support on the alpine variant
# NOTE: As some of them (e.g. dumb-init) will be part of the image, install it here at the earlier build stage
RUN apk add --no-cache python3 make g++ dumb-init

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npx", "tsx", "index.ts"]
