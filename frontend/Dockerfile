# Etapa 1: compilar Angular
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: servir el build estático con nginx
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Angular 17+: dist/<proyecto>/browser. Si usás Angular <=16: /app/dist/*
COPY --from=build /app/dist/*/browser /usr/share/nginx/html
EXPOSE 80
