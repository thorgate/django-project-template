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
	@echo "                This includes copying PyCharm files, creating virtualenv, installing requirements,"
	@echo "                creating local settings file, doing db migrations and installing npm packages."
	@echo ""
	@echo "$(CYAN)make pycharm$(COFF)  - Copies default PyCharm settings (unless they already exist)"
	@echo ""
	@echo "$(CYAN)make test$(COFF)     - Runs automatic tests on your python code"
	@echo ""
	@echo "$(CYAN)make coverage$(COFF) - Runs code test coverage calculation"
	@echo ""
	@echo "$(CYAN)make quality$(COFF)  - Runs automatic code quality tests on your code"
	@echo ""


setup: pycharm settings venv
	@echo "$(CYAN)Installing python packages$(COFF)"
	@$(PROJECT_ROOT)/venv/bin/pip install -r $(PROJECT_ROOT)/requirements/$(ENV).txt
	@echo "$(CYAN)Running django migrations$(COFF)"
	@cd $(SITE_ROOT) && ../venv/bin/python manage.py migrate
	@echo "$(CYAN)Installing npm packages$(COFF)"
	@cd $(SITE_ROOT) && npm install --python=python2.7
	@echo "$(CYAN)===================================================================="
	@echo "SETUP SUCCEEDED"
	@echo "Move into inner '{{cookiecutter.repo_name}}' directory."
	@echo "Run 'npm run dev' to build required Javascript."
	@echo "Run 'python -Wall manage.py runserver' to start Django development server.$(COFF)"

pycharm: $(PROJECT_ROOT)/.idea


$(PROJECT_ROOT)/.idea:
	@echo "$(CYAN)Creating pycharm settings from template$(COFF)"
	@mkdir -p $(PROJECT_ROOT)/.idea && cp -R $(PROJECT_ROOT)/.idea_template/* $(PROJECT_ROOT)/.idea/


venv:
	@echo "$(CYAN)Creating $(PYTHON) virtual environment$(COFF)"
	@cd $(PROJECT_ROOT) && virtualenv -p $(PYTHON) venv


settings: $(SITE_ROOT)/settings/local.py


$(SITE_ROOT)/settings/local.py:
	@echo "$(CYAN)Creating Django settings file$(COFF)"
	@cp $(SITE_ROOT)/settings/local.py.example $(SITE_ROOT)/settings/local.py
	@if [ $(EDIT_SETTINGS) = "yes" ]; then\
		$(EDITOR) $(SITE_ROOT)/settings/local.py;\
	fi


coverage:
	@echo "$(CYAN)Running automatic code coverage check$(COFF)"
	@cd $(SITE_ROOT) && . $(PROJECT_ROOT)/venv/bin/activate && coverage run -m py.test
	@cd $(SITE_ROOT) && . $(PROJECT_ROOT)/venv/bin/activate && coverage html
	@cd $(SITE_ROOT) && . $(PROJECT_ROOT)/venv/bin/activate && coverage report


test: clean
	@echo "$(CYAN)Running automatic tests$(COFF)"
	@cd $(SITE_ROOT) && . $(PROJECT_ROOT)/venv/bin/activate && py.test


clean:
	@echo "$(CYAN)Cleaning pyc files$(COFF)"
	@cd $(SITE_ROOT) && find . -name "*.pyc" -exec rm -rf {} \;


quality:
	@echo "$(CYAN)Running code quality checks$(COFF)"
	@cd $(SITE_ROOT) && . $(PROJECT_ROOT)/venv/bin/activate && npm run stylelint && npm run lint && prospector;
