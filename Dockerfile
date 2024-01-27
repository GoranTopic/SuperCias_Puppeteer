FROM ghcr.io/puppeteer/puppeteer:latest

# root user to be able to access ount directory
USER root

WORKDIR supercias
# pass our own package.json
COPY package.json package.json
COPY reverse_engineer/ reverse_engineer/
COPY src/ src/
# install files 
RUN npm install 

# works with this command
sudo docker run -d -it -v /home/terac/data-mining/supercias/storage/:/home/pptruser/supercias/storage --network="host" --restart=always supercias npm run slave

