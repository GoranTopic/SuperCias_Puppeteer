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
#docker run -it --init --cap-add=SYS_ADMIN -v /home/telix/supercias/data/:/home/pptruser/supercias/data supercias_image npm run slave
