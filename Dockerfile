FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock ./
COPY .yarnrc.yml ./
COPY .yarn ./.yarn

RUN corepack enable
RUN yarn install --immutable

COPY . .

ENTRYPOINT ["node", "./bin/gherlint.js"]
