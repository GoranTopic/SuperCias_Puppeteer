FROM node:latest
WORKDIR supercias
COPY package.json package.json
COPY options.json options.json
COPY src/ src/
RUN npm install 
#CMD npm run companies
RUN --mount=type=bind,source=./data,target=/supercias/data,readwrite
CMD bash
EXPOSE 3000
