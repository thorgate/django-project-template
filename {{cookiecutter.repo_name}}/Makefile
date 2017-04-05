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

# Get root dir and project dir
PROJECT_ROOT ?= $(PWD)
SITE_ROOT ?= $(PROJECT_ROOT)/{{cookiecutter.repo_name}}

BLACK ?= \033[0;30m
RED ?= \033[0;31m
GREEN ?= \033[0;32m
YELLOW ?= \033[0;33m
BLUE ?= \033[0;34m
PURPLE ?= \033[0;35m
CYAN ?= \033[0;36m
GRAY ?= \033[0;37m
COFF ?= \033[0m


all: help


help:
	@echo "+------<<<<                                 Configuration                                >>>>------+"
	@echo ""
	@echo "ENV: $(ENV)"
	@echo "PYTHON: $(PYTHON)"
	@echo "PROJECT_ROOT: $(PROJECT_ROOT)"
	@echo "SITE_ROOT: $(SITE_ROOT)"
	@echo ""
	@echo "+------<<<<                                     Tasks                                    >>>>------+"
	@echo ""
	@echo "$(CYAN)make setup$(COFF)    - Sets up the project in your local machine"
	@echo "                This includes copying PyCharm files, creating local settings file, and setting up Docker."
	@echo ""
	@echo "$(CYAN)make pycharm$(COFF)  - Copies default PyCharm settings (unless they already exist)"
	@echo ""
	@echo "$(CYAN)make test$(COFF)     - Runs automatic tests on your python code"
	@echo ""
	@echo "$(CYAN)make coverage$(COFF) - Runs code test coverage calculation"
	@echo ""
	@echo "$(CYAN)make quality$(COFF)  - Runs automatic code quality tests on your code"
	@echo ""


docker: settings
	@docker-compose down
	@docker-compose build
	@docker-compose up -d
	@docker-compose logs -f


setup: pycharm settings
	@echo "$(CYAN)Creating Docker images$(COFF)"
	@docker-compose build
	@echo "$(CYAN)Running django migrations$(COFF)"
	@make migrate

	@echo "$(CYAN)===================================================================="
	@echo "SETUP SUCCEEDED"
	@echo "Run 'make docker' to start Django development server and Webpack.$(COFF)"

pycharm: $(PROJECT_ROOT)/.idea


$(PROJECT_ROOT)/.idea:
	@echo "$(CYAN)Creating pycharm settings from template$(COFF)"
	@mkdir -p $(PROJECT_ROOT)/.idea && cp -R $(PROJECT_ROOT)/.idea_template/* $(PROJECT_ROOT)/.idea/


settings: $(SITE_ROOT)/settings/local.py


$(SITE_ROOT)/settings/local.py:
	@echo "$(CYAN)Creating Django settings file$(COFF)"
	@cp $(SITE_ROOT)/settings/local.py.example $(SITE_ROOT)/settings/local.py
	@if [ $(EDIT_SETTINGS) = "yes" ]; then\
		$(EDITOR) $(SITE_ROOT)/settings/local.py;\
	fi


coverage:
	@echo "$(CYAN)Running automatic code coverage check$(COFF)"
	@docker-compose run --rm django coverage run -m py.test
	@docker-compose run --rm django coverage html
	@docker-compose run --rm django coverage report


test: clean
	@echo "$(CYAN)Running automatic tests$(COFF)"
	@docker-compose run --rm django py.test


clean:
	@echo "$(CYAN)Cleaning pyc files$(COFF)"
	@cd $(SITE_ROOT) && find . -name "*.pyc" -exec rm -rf {} \;


quality: stylelint eslint prospector


eslint:
	@echo "$(CYAN)Running ESLint$(COFF)"
	@docker-compose run --rm node npm run lint


prospector:
	@echo "$(CYAN)Running Prospector$(COFF)"
	@docker-compose run --rm django prospector


stylelint:
	@echo "$(CYAN)Running StyleLint$(COFF)"
	@docker-compose run --rm node npm run stylelint


docker-django:
	docker-compose run --rm django $(cmd)


docker-manage:
	docker-compose run --rm django ./manage.py $(cmd)


shell:
	docker-compose run --rm django ./manage.py shell


makemigrations:
	docker-compose run --rm django ./manage.py makemigrations $(cmd)


migrate:
	docker-compose run --rm django ./manage.py migrate $(cmd)


docker-logs:
	docker-compose logs -f


makemessages:
	docker-compose run --rm django ./manage.py makemessages -a
	docker-compose run --rm django ./manage.py makemessages -a -d djangojs


compilemessages:
	docker-compose run --rm django ./manage.py compilemessages


psql:
	docker-compose exec postgres psql --user {{cookiecutter.repo_name}} --dbname {{cookiecutter.repo_name}}
