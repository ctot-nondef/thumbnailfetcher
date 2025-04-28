FROM node:22-alpine

COPY . /var/www/

WORKDIR /var/www/

RUN pnpm ci
RUN pnpm run build

CMD ["bash"]






