FROM node:18-alpine

RUN apt update &&\
    apt install -y git

COPY . /var/www/

WORKDIR /var/www/

RUN npm ci
RUN npm run build

CMD ["bash"]






