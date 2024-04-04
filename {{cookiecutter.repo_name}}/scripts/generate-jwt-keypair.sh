#!/usr/bin/env bash

# Description: Generate RSA keypair for JWT authentication for local development.
#  This script replaces DJANGO_JWT_PRIVATE_KEY="" and DJANGO_JWT_PUBLIC_KEY="" with the generated keys.
#
# Usage: ./generate-jwt-keypair.sh <dot env file>

set -e

input_file=$1

openssl genrsa -out privatekey.pem 4096
openssl rsa -in privatekey.pem -pubout -out publickey.pem
privatekey=$(cat ./privatekey.pem)
publickey=$(cat ./publickey.pem)
rm -f privatekey.pem publickey.pem

privatekey=${privatekey//$'\n'/\\n}
publickey=${publickey//$'\n'/\\n}

sed -i "s|DJANGO_JWT_PRIVATE_KEY=\\\"\\\"|DJANGO_JWT_PRIVATE_KEY=\\\"${privatekey}\\\"|g" $input_file
sed -i "s|DJANGO_JWT_PUBLIC_KEY=\\\"\\\"|DJANGO_JWT_PUBLIC_KEY=\\\"${publickey}\\\"|g" $input_file
