FROM node:10-slim

# Install app dependencies.
COPY package.json /src/package.json
WORKDIR /src
RUN npm install

# Bundle app source.
COPY . /src

CMD ["npm", "start"]