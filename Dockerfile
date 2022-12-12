FROM node:latest

RUN apt update &&\
    apt install -y git

COPY . /var/www/

WORKDIR /var/www/

RUN npm install
RUN npm run build

CMD ["bash"]






