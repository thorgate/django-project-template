# Based on Node 10.x LTS image
FROM node:{{ cookiecutter.node_version }}-alpine

# Install system requirements
RUN apk add --no-cache build-base python bash

# Set the default directory where CMD will execute
WORKDIR /app

# Set the default command to execute when creating a new container
CMD /bin/bash -c "yarn && yarn dev"
