#!/usr/bin/env bash

set -e

if [[ -z ${AWS_ACCESS_KEY_ID} ]]; then
    echo "Please define AWS_ACCESS_KEY_ID"
    exit 1
fi

if [[ -z ${AWS_SECRET_ACCESS_KEY} ]]; then
    echo "Please define AWS_SECRET_ACCESS_KEY"
    exit 1
fi

echo "Syncing with S3"

rm -rf /wheelhouse/*.txt /wheelhouse/*.html /wheelhouse/simple

aws s3 cp /wheelhouse s3://tg-public.wheels --recursive --acl 'public-read'

rm -rf /wheelhouse/*.txt /wheelhouse/*.html /wheelhouse/simple

echo "Synced, generating listing page"

cat listing-head.html > /index.html
echo "" > /list.txt

WHEELS=$(aws s3 ls s3://tg-public.wheels/ | awk '{print $4}' | grep ".whl")
PACKAGES="Django asn1crypto cffi cryptography idna lxml numpy pandas pycparser python_dateutil pytz six tg_utils"

for item in ${WHEELS}
do
    url="https://s3.eu-central-1.amazonaws.com/tg-public.wheels/${item}"
    echo "<li><a href='$url'>$item</a></li>" >> /index.html
    echo "$url" >> /list.txt
done

cat listing-foot.html >> /index.html

aws s3 cp /index.html s3://tg-public.wheels/index.html --acl 'public-read'
aws s3 cp /list.txt s3://tg-public.wheels/list.txt --acl 'public-read'

echo "Listing page generated, creating PYPI simple api"

mkdir -p /simple

echo "<!DOCTYPE html>
<html>
  <body>
" > /simple/index.html

for pkg in ${PACKAGES}
do
    echo "<a href='./$pkg'>$pkg</a>" >> /simple/index.html
    mkdir -p /simple/${pkg}

    echo "<!DOCTYPE html>
    <html>
      <body>
    " > /simple/${pkg}/index.html

    for wheel in ${WHEELS}
    do
        if echo ${wheel} | grep "$pkg-"; then
            url="https://s3.eu-central-1.amazonaws.com/tg-public.wheels/${wheel}"
            echo "<a href='$url'>$wheel</a>" >> /simple/${pkg}/index.html
            echo "$wheel"
        fi
    done

    echo "
      </body>
    </html>
    " >> /simple/${pkg}/index.html
done

echo "
  </body>
</html>
" >> /simple/index.html

aws s3 cp /simple s3://tg-public.wheels/simple --recursive --acl 'public-read'
