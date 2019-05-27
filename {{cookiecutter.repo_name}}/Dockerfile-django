# Development Dockerfile for Django app

FROM python:{{ cookiecutter.python_version }}-alpine3.8

COPY ./wait-for-it.sh /usr/bin/

# Install bash, libpq{% if cookiecutter.include_cms == 'yes' %}, libjpeg-turbo{% endif %} and gettext
# Bash is required to support `wait-for-it.sh` script, should not add too much to docker image
RUN apk add --no-cache bash gettext libpq{% if cookiecutter.include_cms == 'yes' %} libjpeg-turbo{% endif %}

# Install build dependencies and mark them as virtual packages so they could be removed together
RUN apk add --no-cache --virtual .build-deps \
    ca-certificates alpine-sdk postgresql-dev python3-dev linux-headers musl-dev \
    libffi-dev libxml2-dev libxslt-dev jpeg-dev zlib-dev

# Copy Python requirements dir and Install requirements
RUN pip install -U pipenv==2018.11.26 pip setuptools wheel

COPY Pipfile /
COPY Pipfile.lock /

# Install all dependencies from Pipfile.lock file
RUN pipenv install --system --ignore-pipfile --dev

# Check for security warnings, will be enabled later when failing dependencies have been updated
# RUN pipenv check --system

# Find all file objects containing name `test` or compiled python files and remove them
# Find all runtime dependencies that are marked as needed by scanelf
# scanelf is utility to show ELF data for binary objects
# For more info: https://wiki.gentoo.org/wiki/Hardened/PaX_Utilities#The_scanelf_application
# Finally re-install missing run-dependencies
RUN find /usr/local \
        \( -type d -a -name test -o -name tests \) \
        -o \( -type f -a -name '*.pyc' -o -name '*.pyo' \) \
        -exec rm -rf '{}' + \
  && runDeps="$( \
        scanelf --needed --nobanner --recursive /usr/local \
                | awk '{ gsub(/,/, "\nso:", $2); print "so:" $2 }' \
                | sort -u \
                | xargs -r apk info --installed \
                | sort -u \
    )" \
  && apk add --virtual .rundeps $runDeps

# Remove build dependencies
RUN apk del .build-deps

# Set the default directory where CMD will execute
WORKDIR /app

# Run Django's runserver by default
CMD python manage.py runserver 0.0.0.0:80
