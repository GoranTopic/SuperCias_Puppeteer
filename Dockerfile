FROM ghcr.io/puppeteer/puppeteer:latest

WORKDIR supercias
COPY package.json package.json
COPY options.json options.json
COPY src/ src/
RUN npm install 

#docker run -it --init --cap-add=SYS_ADMIN -v /home/telix/supercias/data/:/home/pptruser/supercias/data supercias_image npm run start
