FROM node:22-alpine

RUN corepack enable

COPY . /var/www/

WORKDIR /var/www/

RUN pnpm install --frozen-lockfile
RUN pnpm run build

CMD ["bash"]






