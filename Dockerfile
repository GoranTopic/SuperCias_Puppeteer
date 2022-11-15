FROM ghcr.io/puppeteer/puppeteer:latest
RUN npm install chalk image-js json-fn moment puppeteer puppeteer-extra puppeteer-extra-plugin-stealth tesseract.js truncate-utf8-bytes
WORKDIR /supercias
COPY src/ src/
COPY pack/ src/

