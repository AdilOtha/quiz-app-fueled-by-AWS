FROM 222799461289.dkr.ecr.us-east-1.amazonaws.com/node:14.15.1 as build

WORKDIR /app

# COPY package*.json ./
# RUN npm install
COPY . ./
RUN npm install
RUN npm run build
FROM 222799461289.dkr.ecr.us-east-1.amazonaws.com/nginx:1.19

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/csci5409-s22-group16-frontend /usr/share/nginx/html