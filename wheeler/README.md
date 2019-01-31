# Prebuilt wheels for common dependencies to speed up docker image build times

Wheels listed: https://s3.eu-central-1.amazonaws.com/tg-public.wheels/index.html
PIPY compatible index: 

- HTTPS: https://d8si7v9xtdiho.cloudfront.net/simple
- HTTP: http://tg-public.wheels.s3-website.eu-central-1.amazonaws.com/simple/

## Adding a new package

1. Add the package into `Dockerfile`
2. If it is a new package not only a new version then also update `PACKAGES` list inside `sync.sh`
3. Continue with **Updating the wheels**

## Updating the wheels

```
docker build -t wheeler .
docker run -it --rm wheeler
```

Then inside the container:

```
export AWS_ACCESS_KEY_ID='<your key here>'
export AWS_SECRET_ACCESS_KEY='<your key here>'
/sync.sh
```
