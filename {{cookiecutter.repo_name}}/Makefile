# ENV defaults to local (so that requirements/local.txt are installed), but can be overridden
#  (e.g. ENV=production make setup).
ENV ?= local
# PYTHON specifies the python binary to use when creating virtualenv
PYTHON ?= python{{cookiecutter.python_version}}

# Editor can be defined globally but defaults to nano
EDITOR ?= nano

# By default we open the editor after copying settings, but can be overridden
#  (e.g. EDIT_SETTINGS=no make settings).
EDIT_SETTINGS ?= yes

# Project name
PROJECT_NAME ?= {{cookiecutter.repo_name}}

# Django folder name
DJANGO_FOLDER_NAME ?= {{cookiecutter.django_folder_name}}

# Get root dir and project dir
PROJECT_ROOT ?= $(CURDIR)
SITE_ROOT ?= $(PROJECT_ROOT)/$(DJANGO_FOLDER_NAME)

CUR_DIR_NAME ?= $(shell basename `pwd`)
DJANGO_IMAGE_NAME ?= $(CUR_DIR_NAME)-django
POETRY_WRAPPER_IMAGE_NAME ?= $(PROJECT_NAME)-poetry-wrapper

# - {%- if cookiecutter.frontend_style == SPA %}
JS_COBERTURA="app/coverage/cobertura-coverage.xml"
# - {% elif cookiecutter.frontend_style == WEBAPP %}
JS_COBERTURA="webapp/coverage/cobertura-coverage.xml"
# - {%- endif %}

# Cache dirs for poetry/pip
#
# To have one big cache for all your projects just add the following to your profile:
#
# export DPT_POETRY_CACHE_DIR=/path/to/cache/pypoetry
# export DPT_PIP_CACHE_DIR=/path/to/cache/pip
#
# Note: We do not recommend to share the cache with your system pip/poetry/ruff cache as you
#        will start getting PermissionError's when interfacing with pip/poetry on your machine.
DPT_POETRY_CACHE_DIR ?= $(PROJECT_ROOT)/.data/pycache/pypoetry
DPT_PIP_CACHE_DIR ?= $(PROJECT_ROOT)/.data/pycache/pip
DPT_RUFF_CACHE_DIR ?= $(PROJECT_ROOT)/.data/pycache/ruff

BLACK ?= \033[0;30m
RED ?= \033[0;31m
GREEN ?= \033[0;32m
YELLOW ?= \033[0;33m
BLUE ?= \033[0;34m
PURPLE ?= \033[0;35m
CYAN ?= \033[0;36m
GRAY ?= \033[0;37m
COFF ?= \033[0m

.PHONY:
all: help


.PHONY:
help:
	@echo -e "+------<<<<                                 Configuration                                >>>>------+"
	@echo -e ""
	@echo -e "ENV: $(ENV)"
	@echo -e "PYTHON: $(PYTHON)"
	@echo -e "PROJECT_ROOT: $(PROJECT_ROOT)"
	@echo -e "SITE_ROOT: $(SITE_ROOT)"
	@echo -e "DPT_POETRY_CACHE_DIR: $(DPT_POETRY_CACHE_DIR)"
	@echo -e "DPT_RUFF_CACHE_DIR: $(DPT_RUFF_CACHE_DIR)"
	@echo -e "DPT_PIP_CACHE_DIR: $(DPT_PIP_CACHE_DIR)"
	@echo -e ""
	@echo -e "+------<<<<                                     Tasks                                    >>>>------+"
	@echo -e ""
	@grep --no-filename -E '^[a-zA-Z_%-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	@echo -e ""

.PHONY:
build-poetry-helper:
	@docker build -q $(PROJECT_ROOT) \
	    -f Dockerfile-poetry \
	    --build-arg DPT_VENV_CACHING \
	    --tag $(POETRY_WRAPPER_IMAGE_NAME) > /dev/null


.PHONY:
run-poetry-helper: build-poetry-helper
	@docker run --rm --name $(POETRY_WRAPPER_IMAGE_NAME) -v $(PROJECT_ROOT):/src \
	 -v $(DPT_POETRY_CACHE_DIR):/root/.cache/pypoetry \
	 -v $(DPT_PIP_CACHE_DIR):/root/.cache/pip \
	 $(POETRY_WRAPPER_IMAGE_NAME) sh -c "$(cmd) && chown `id -u`:`id -g` poetry.lock"


.PHONY:
poetry-lock: pyproject.toml
	@make run-poetry-helper cmd="poetry lock"
	@cd $(SITE_ROOT) && ln -sf ../poetry.lock .


poetry.lock:
	@make poetry-lock


.PHONY:
pyproject.toml: $(SITE_ROOT)/pyproject.toml


$(SITE_ROOT)/pyproject.toml:
	@cd $(SITE_ROOT) && ln -sf ../pyproject.toml .


.PHONY:
poetry-check:
	@echo -e "$(CYAN)Checking lockfile is up to date$(COFF)"
	@make run-poetry-helper cmd="sh /poetry-check-lock.sh"
	@echo -e "$(CYAN)Running poetry check$(COFF)"
	@make run-poetry-helper cmd="poetry check"
	@echo -e "$(CYAN)Checking dependencies with pip-audit$(COFF)"
	@make run-python cmd="bash -c \"cat /ignored-vulnerabilities.txt | grep -v '^[#;]' | grep -v -x '\s*' | sed 's/^/--ignore-vuln /' | tr '\n' ' ' | xargs poetry run pip-audit --fix --dry-run --desc\""
	@cat ignored-vulnerabilities.txt | grep -v '^;'


.PHONY:
poetry-add:
	@make run-poetry-helper cmd="poetry add $(cmd)"


.PHONY:
dev-venv-path:
	@make run-poetry-helper cmd="python /generate-path.py"


# NOTE:
# As node doesn't depend on any service, we can run prettier
#  directly from the node container with docker compose
.PHONY:
run-prettier:
	@docker compose run --rm node $(cmd)


.PHONY:
prettier-check:
	@make run-prettier cmd="yarn prettier-check $(cmd)"


.PHONY:
prettier-check-all:
	@make run-prettier cmd="yarn prettier-check-all $(cmd)"


.PHONY:
prettier-format:
	@make run-prettier cmd="yarn prettier-format $(cmd)"


.PHONY:
prettier-format-cut-prefix:
{%- if cookiecutter.frontend_style == SPA %}
	@make run-prettier cmd="yarn prettier-format $(subst app/src, src, $(cmd))"
{%- else %}
	@make run-prettier cmd="yarn prettier-format $(subst webapp/webapp, webapp, $(cmd))"
{%- endif %}


.PHONY:
prettier-format-all: ## Format JavaScript code with Prettier
	@make run-prettier cmd="yarn prettier-format-all $(cmd)"


# NOTE:
# Do not use `docker compose run` to avoid spawning services by the django container
.PHONY:
run-python:
	@set -e ;\
	if [ "`docker images|grep $(DJANGO_IMAGE_NAME)`" = '' ]; then \
	    docker compose build django || exit $$?; \
	fi; \
	docker run -t --rm \
	 -v $(DPT_POETRY_CACHE_DIR):/root/.cache/pypoetry \
	 -v $(DPT_RUFF_CACHE_DIR):/root/.cache/ruff \
	 -v $(DPT_PIP_CACHE_DIR):/root/.cache/pip \
	 -v $(SITE_ROOT):/app \
	 -v $(PROJECT_ROOT)/pyproject.toml:/pyproject.toml \
	 -v $(PROJECT_ROOT)/poetry.lock:/poetry.lock \
	  $(DJANGO_IMAGE_NAME) $(cmd)



.PHONY:
docker: settings
	@docker compose down
	@docker compose build
	@docker compose up -d
	@docker compose logs -f


.PHONY:
setup: pycharm settings ## Sets up the project in your local machine. This includes copying PyCharm files, creating local settings file, and setting up Docker
	@echo -e "$(CYAN)Creating Docker images$(COFF)"
	@docker compose build
	@echo -e "$(CYAN)Running django migrations$(COFF)"
	@make migrate
	@echo -e "$(CYAN)Installing node modules$(COFF)"
	@make node-install
{% if cookiecutter.frontend_style == SPA %}
	@echo -e "$(CYAN)Extracting JS translations$(COFF)"
	@make extract-i18n
{% endif %}
	@echo -e "$(CYAN)===================================================================="
	@echo -e "SETUP SUCCEEDED"
	@echo -e "Run 'make docker' to start Django development server and Webpack.$(COFF)"


{%- if cookiecutter.thorgate == YES %}


.PHONY:
setup-terraform:
	@echo -e "$(CYAN)Setting up terraform$(COFF)"
	@./utils/terraform/setup.sh $(workspace)
{%- endif %}


.PHONY:
pycharm: $(PROJECT_ROOT)/.idea ## Copies default PyCharm settings (unless they already exist)


$(PROJECT_ROOT)/.idea:
	@echo -e "$(CYAN)Creating pycharm settings from template$(COFF)"
	@mkdir -p $(PROJECT_ROOT)/.idea && cp -R $(PROJECT_ROOT)/.idea_template/* $(PROJECT_ROOT)/.idea/


$(PROJECT_ROOT)/.env:
	@echo -e "$(CYAN)Copying .env file$(COFF)"
	@cp $(PROJECT_ROOT)/.env.example $(PROJECT_ROOT)/.env


.PHONY:
settings: $(PROJECT_ROOT)/.env poetry.lock $(SITE_ROOT)/settings/local.py $(SITE_ROOT)/settings/local_test.py


$(SITE_ROOT)/settings/local.py:
	@echo -e "$(CYAN)Creating Django local.py settings file$(COFF)"
	cp $(SITE_ROOT)/settings/local.py.example $(SITE_ROOT)/settings/local.py
	if [ $(EDIT_SETTINGS) = "yes" ]; then\
		$(EDITOR) $(SITE_ROOT)/settings/local.py;\
	fi

$(SITE_ROOT)/settings/local_test.py:
	@echo -e "$(CYAN)Creating Django settings local_test.py file$(COFF)"
	@cp $(SITE_ROOT)/settings/local_test.py.example $(SITE_ROOT)/settings/local_test.py


.PHONY:
{%- if cookiecutter.frontend_style == 'webapp' %}
coverage-py: webapp/webapp/build  ## Runs python/django test coverage calculation
{%- else %}
coverage-py: ## Runs python/django test coverage calculation
{%- endif %}
	@echo -e "$(CYAN)Running automatic code coverage check$(COFF)"
	@docker compose run --rm django pytest --cov=. --cov-report html --cov-report xml --cov-report term-missing $(cmd)


.PHONY:
patch-coverage-py-paths:  ## Updates the paths in python cobertura report to make it work with Gitlab
	sed -i -e "s|<source>.|<source>${CI_PROJECT_DIR}/${DJANGO_FOLDER_NAME}/|" ${DJANGO_FOLDER_NAME}/coverage.xml


.PHONY:
coverage-js:
	@echo -e "$(CYAN)Running automatic code coverage check$(COFF)"
	@docker compose run --rm node yarn test --coverage $(cmd)


.PHONY:
patch-coverage-js-paths:  ## Updates the paths in JS cobertura report to make it work with Gitlab
	sed -i -e "s|<source>../</source>| |" ${JS_COBERTURA}
	sed -i -e "s|<sources>| |" ${JS_COBERTURA}
	sed -i -e "s|</sources>| |" ${JS_COBERTURA}
{%- if cookiecutter.frontend_style == 'webapp' %}
	sed -i -e "s|app/|webapp/|" ${JS_COBERTURA}
{%- endif %}


.PHONY:
coverage: coverage-py coverage-js  ## Runs all tests with coverage


.PHONY:
node-install:
	@docker compose run --rm node yarn


.PHONY:
test-node-watch: clean
	@docker compose run --rm node yarn test -- --watchAll


.PHONY:
test-js: clean
	@echo -e "$(CYAN)Running automatic node.js tests$(COFF)"
	@docker compose run --rm node yarn test $(cmd)


.PHONY:
test-py: clean{% if cookiecutter.frontend_style == 'webapp' %} webapp/webapp/build{% endif %}
	@echo -e "$(CYAN)Running automatic django tests$(COFF)"
	@docker compose run --rm django py.test $(cmd)
{%- if cookiecutter.frontend_style == 'webapp' %}

webapp/webapp/build:
	mkdir -p webapp/webapp/build
{%- endif %}

.PHONY:
test-django: test-py

.PHONY:
test-node: test-js

.PHONY:
test: test-js test-py ## Runs automatic tests on your code


.PHONY:
clean:
	@echo -e "$(CYAN)Cleaning pyc files$(COFF)"
	@make run-python cmd='find . -name "*.pyc" -exec rm -rf {} \;'


.PHONY:
ifdef GITLAB_CI
lint-py: ruff-format-check prospector
else
lint-py: ruff-format-check ruff-lint prospector
endif

.PHONY:
lint-js: prettier-check-all eslint node-typecheck stylelint

.PHONY:
lint: lint-py lint-js

.PHONY:
quality: lint poetry-check

.PHONY:
fmt-py: ruff-format ruff-lint-fix

.PHONY:
fmt-js: eslint-fix prettier-format-all

.PHONY:
fmt: fmt-py fmt-js

# Aliases to format commands
.PHONY:
fix: fmt

.PHONY:
format: fmt


.PHONY:
eslint:
	@echo -e "$(CYAN)Running ESLint$(COFF)"
	@docker compose run --rm node yarn lint:eslint

.PHONY:
node-typecheck:
	@echo "$(CYAN)Running Node Typecheck(COFF)"
	@docker compose run --rm node yarn lint:tsc $(cmd)


.PHONY:
eslint-fix:
	@echo -e "$(CYAN)Running ESLint$(COFF)"
	@docker compose run --rm node yarn lint:eslint --fix


.PHONY:
prospector:
	@echo -e "$(CYAN)Running Prospector$(COFF)"
	@make run-python cmd='prospector --with-tool bandit --without-tool pep257 -X'


{%- if cookiecutter.use_mypy == YES %}


.PHONY:
mypy:
	@echo -e "$(CYAN)Checking types$(COFF)"
	@make run-python cmd="mypy --show-error-codes ."
{%- endif %}


.PHONY:
stylelint:
	@echo -e "$(CYAN)Running StyleLint$(COFF)"
	@docker compose run --rm node yarn stylelint


.PHONY:
ruff-format-check:
	@echo -e "$(subst SECTION_NAME,ruff-format-check,$(GL_SECTION_START))$(CYAN)Running ruff format (check)$(COFF)"
	@make run-python cmd="ruff format . --diff"
	@make run-python cmd="ruff --select I . --diff"
	@echo -e "$(subst SECTION_NAME,ruff-format-check,$(GL_SECTION_END))"

.PHONY:
ruff-format:
	@echo -e "$(CYAN)Running ruff format$(COFF)"
	@make run-python cmd="ruff format ."
	@make run-python cmd="ruff --select I . --fix"

.PHONY:
ruff-lint:
	@echo -e "$(CYAN)Running The Ruff Linter$(COFF)"
	@make run-python cmd="ruff ."

.PHONY:
ruff-lint-fix:
	@make run-python cmd="ruff --fix --exit-non-zero-on-fix ."

.PHONY:
ruff-lint-ci:
	@echo -e "$(subst SECTION_NAME,ruff-linter,$(GL_SECTION_START))$(CYAN)Running The Ruff Linter [ci]$(COFF)"
	@make run-python cmd="ruff --exit-zero --output-format gitlab --output-file coverage/python/ruff.json ."
	# might be wrong here...
	@make run-python cmd="sed -i 's|\"path\": \"|&${CI_PROJECT_DIR}/${DJANGO_FOLDER_NAME}/|g' coverage/python/ruff.json"
	@echo -e "$(subst SECTION_NAME,ruff-linter,$(GL_SECTION_END))"

.PHONY:
docker-django:
	docker compose run --rm django $(cmd)


.PHONY:
django-shell:
	docker compose run --rm django bash


.PHONY:
node-shell:
	docker compose run --rm node bash


.PHONY:
django-fix-ownership:
	@docker compose run --rm django chown -R `id -u`:`id -g` ./

.PHONY:
node-fix-ownership:
	@docker compose run --rm node chown -R `id -u`:`id -g` ./


.PHONY:
django-manage:
	docker compose run --rm django ./manage.py $(cmd)

.PHONY:
docker-manage: django-manage


.PHONY:
shell:
	docker compose run --rm django ./manage.py shell


.PHONY:
makemigrations:
	docker compose run --rm django ./manage.py makemigrations $(cmd)
	@make django-fix-ownership
	@make fmt-py



.PHONY:
migrate:
	docker compose run --rm django ./manage.py migrate $(cmd)


.PHONY:
docker-logs:
	docker compose logs -f


.PHONY:
makemessages:
	docker compose run --rm django ./manage.py makemessages -a
{%- if cookiecutter.frontend_style == WEBAPP %}
	docker compose run --rm django ./manage.py makemessages -a -d djangojs
{%- endif %}

.PHONY:
compilemessages:
	docker compose run --rm django ./manage.py compilemessages


{% if cookiecutter.frontend_style == SPA -%}
.PHONY:
extract-i18n:
	docker compose run --rm node yarn extract-i18n
{%- endif %}


$(SITE_ROOT)/locale:
	mkdir -p $(SITE_ROOT)/locale


.PHONY:
add-locale: $(SITE_ROOT)/locale
ifdef LOCALE
	@echo -e "Adding new locale $(LOCALE)"
	docker compose run --rm django ./manage.py makemessages -l $(LOCALE)
	docker compose run --rm django ./manage.py makemessages -d djangojs -i node_modules -l $(LOCALE)
	@echo -e "Restoring file permissions"
	@docker compose run --rm django sh -c "chown -R `id -u`:`id -g` ./locale/"
else
	@echo -e "$(RED)Please specify the locale you would like to add via LOCALE (e.g. make add-locale LOCALE='et')$(COFF)"
endif


.PHONY:
psql:
	docker compose exec postgres psql --user $(PROJECT_NAME) --dbname $(PROJECT_NAME)

{%- if cookiecutter.webapp_include_storybook == YES %}
.PHONY:
storybook:
	@echo -e "$(CYAN)Open http://127.0.0.1:6006 to view after storybook starts$(COFF)"
	docker compose run --rm -p 6006:6006 node yarn storybook
{%- endif %}

{%- if cookiecutter.use_cypress == YES %}
include Makefile-cypress
{%- endif %}
