FROM python:3.6.8-alpine3.8 as base

# Install build dependencies
RUN apk add --no-cache --virtual .build-deps \
    ca-certificates alpine-sdk postgresql-dev python3-dev python2-dev linux-headers musl-dev \
    libffi-dev libxml2-dev libxslt-dev jpeg-dev zlib-dev bash gettext wget

# Install requirements
RUN pip install -U pipenv pip setuptools wheel awscli cython==0.29.3

RUN mkdir -p /wheelhouse

RUN wget -i https://s3.eu-central-1.amazonaws.com/tg-public.wheels/list.txt -P /wheelhouse
RUN ls -la /wheelhouse

COPY sync.sh /sync.sh
COPY listing-head.html /listing-head.html
COPY listing-foot.html /listing-foot.html

ENV WHEELIT='pip wheel --prefer-binary --wheel-dir=/wheelhouse --find-links=/wheelhouse'
ENV PIPIT='pip install --prefer-binary --find-links=/wheelhouse'

# lxml
RUN $WHEELIT lxml==4.3.0
RUN $WHEELIT lxml==4.2.6
RUN $WHEELIT lxml==4.2.5
RUN $WHEELIT lxml==4.2.4
RUN $WHEELIT lxml==4.2.3
RUN $WHEELIT lxml==4.2.2
RUN $WHEELIT lxml==4.2.1
RUN $WHEELIT lxml==4.2.0
RUN $WHEELIT lxml==4.1.1
RUN $WHEELIT lxml==4.1.0
RUN $WHEELIT lxml==4.0.0
RUN $WHEELIT lxml==3.8.0
RUN $WHEELIT lxml==3.7.3
RUN $WHEELIT lxml==3.7.2
RUN $WHEELIT lxml==3.7.1
RUN $WHEELIT lxml==3.7.0
RUN $WHEELIT lxml==3.6.4
RUN $WHEELIT lxml==3.6.3
RUN $WHEELIT lxml==3.6.2
RUN $WHEELIT lxml==3.6.1
RUN $WHEELIT lxml==3.6.0
RUN $WHEELIT lxml==3.5.0
RUN $WHEELIT lxml==3.4.4
RUN $WHEELIT lxml==3.4.3
RUN $WHEELIT lxml==3.4.2
RUN $WHEELIT lxml==3.4.1
RUN $WHEELIT lxml==3.4.0

# cryptography
RUN $WHEELIT cryptography==2.5
RUN $WHEELIT cryptography==2.4.2
RUN $WHEELIT cryptography==2.4.1
RUN $WHEELIT cryptography==2.4
RUN $WHEELIT cryptography==2.3.1
RUN $WHEELIT cryptography==2.3

# Numpy
RUN $WHEELIT numpy==1.15.4
RUN $WHEELIT numpy==1.15.3
RUN $WHEELIT numpy==1.15.2
RUN $WHEELIT numpy==1.15.1
RUN $WHEELIT numpy==1.15.0
RUN $WHEELIT numpy==1.14.6
RUN $WHEELIT numpy==1.14.5

# Pandas
RUN $PIPIT numpy==1.15.4
RUN $WHEELIT pandas==0.24.0
RUN $WHEELIT pandas==0.23.4
RUN $WHEELIT pandas==0.23.3
RUN $WHEELIT pandas==0.23.2
RUN $WHEELIT pandas==0.23.1
RUN $WHEELIT pandas==0.23.0

CMD /bin/bash
