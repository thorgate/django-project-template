FROM node:12

RUN mkdir /codemod
WORKDIR /codemod

COPY package.json /codemod
COPY tsconfig.json /codemod

RUN yarn install --frozenlockfile

COPY transforms /codemod

CMD yarn transform
