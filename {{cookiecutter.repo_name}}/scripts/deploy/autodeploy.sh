#!/usr/bin/env bash

set -e

TARGET_TYPE=$1
DEPLOY_HOSTNAME=$2
AUTODEPLOY_VAULT_PW_FILE=$3
DEPLOY_COMMIT=$4

usage() {
    echo "usage: autodeploy.sh <target_type> <hostname> <autodeploy_vault_pw_file> <deploy_commit>"
    exit 1
}

if [[ -z ${TARGET_TYPE} ]] || [[ -z ${DEPLOY_HOSTNAME} ]] || [[ -z ${AUTODEPLOY_VAULT_PW_FILE} ]] || [[ -z ${DEPLOY_COMMIT} ]]; then
    usage
fi


DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ANSIBLE_DIR="${DIR}/../../ansible"
VAULT_FILE="autodeploy_vault.${TARGET_TYPE}.yml"


if [ ! -f "${ANSIBLE_DIR}/${VAULT_FILE}" ]; then
    echo "vault: ansible/${VAULT_FILE} does not exist!"
    usage
fi


set -x  # Echo commmands as they are executed

echo_cyan() {
    echo -e "\033[1;36m$1\033[0m"
}

setup_ssh() {
    echo_cyan "Setting up SSH dependencies"

    # Extract keys from vault
    cd ${ANSIBLE_DIR}

    poetry run ansible-vault decrypt \
        --vault-password-file ${AUTODEPLOY_VAULT_PW_FILE} \
        --output - ${VAULT_FILE} \
        | yq e '.autodeploy_public_key' - >> ~/.ssh/id_ed25519.pub

    poetry run ansible-vault decrypt \
        --vault-password-file ${AUTODEPLOY_VAULT_PW_FILE} \
        --output - ${VAULT_FILE} \
        | yq e '.autodeploy_private_key' - >> ~/.ssh/id_ed25519

    chmod 0600 ~/.ssh/*
}

install_deps() {
    echo_cyan "Installing dependencies"
    cd ${ANSIBLE_DIR} && \
        poetry install && \
        sed -i ansible.cfg -e 's|ask_vault_pass|;ask_vault_pass|' && \
        sed -i ansible.cfg -e 's|become_ask_pass|;become_ask_pass|'
}

deploy() {
    cd ${ANSIBLE_DIR}

    set +x # stop echoing commands

    echo_cyan "EXTRACTING CREDENTIALS FROM VAULT ${VAULT_FILE}"
    DEPLOY_USERNAME=`poetry run ansible-vault decrypt \
        --vault-password-file ${AUTODEPLOY_VAULT_PW_FILE} \
        --output - ${VAULT_FILE} \
        | yq e '.autodeploy_user_name' -`
    DEPLOY_PASSWORD=`poetry run ansible-vault decrypt \
        --vault-password-file ${AUTODEPLOY_VAULT_PW_FILE} \
        --output - ${VAULT_FILE} \
        | yq e '.autodeploy_user_password' -`

    poetry run ansible-vault decrypt \
        --vault-password-file ${AUTODEPLOY_VAULT_PW_FILE} \
        --output - ${VAULT_FILE} \
        | yq e '.deploy_vault_pw' - > /tmp/vault.pw

    echo_cyan "EXECUTING ANSIBLE against ${DEPLOY_HOSTNAME}"
    poetry run ansible-playbook \
        --vault-password-file /tmp/vault.pw \
        --user ${DEPLOY_USERNAME} -e "ansible_become_pass=${DEPLOY_PASSWORD}" \
        -l ${DEPLOY_HOSTNAME} -e "force_deploy=${DEPLOY_BRANCH}" -v deploy.yml
}

install_deps
setup_ssh
deploy
