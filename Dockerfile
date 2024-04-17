FROM ghcr.io/puppeteer/puppeteer:latest

# root user to be able to access ount directory
USER root

WORKDIR supercias
# pass our own package.json
COPY package.json package.json
COPY src/ src/
# install files 
RUN npm install 

# works with this command
#sudo docker run -d -it -v /home/<user>/data-mining/supercias/storage/:/home/pptruser/supercias/storage --network="host" --restart=always supercias npm run slave

