FROM node:18-alpine

WORKDIR /app

# COPY package*.json ./
# Copy all files except node_modules and .next
COPY . ./
# RUN rm -rf node_modules .next
RUN npm install


EXPOSE 3000

CMD ["npm", "run", "dev"]
