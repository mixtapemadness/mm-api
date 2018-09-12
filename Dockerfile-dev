#FROM keymetrics/pm2:8
FROM node:8

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json /usr/src/app/

RUN npm install pm2 -g
RUN npm install nodemon -g
RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . /usr/src/app

EXPOSE 8001
# CMD [ "npm", "start" ]
CMD ["pm2-docker", "process.json", "--only", "mixtape-backend-development"]
