FROM node:18-alpine

COPY . /var/www/

WORKDIR /var/www/

RUN npm ci
RUN npm run build

CMD ["bash"]






