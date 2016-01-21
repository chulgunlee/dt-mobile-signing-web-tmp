DEPLOY_ENVIRONMENT ?= ci

PIP_INDEX = -i http://10.134.8.12:8000/simple/
PIP_FLAGS = $(PIP_INDEX) --trusted-host 10.134.8.12

TEST = nosetests
TEST_ENV = DEPLOY_ENVIRONMENT=$(DEPLOY_ENVIRONMENT) DJANGO_SETTINGS_MODULE=signingroom.settings.dev_local
USE_CONFIG_FROM_VIRTUAL_ENV = False


ifdef TEST_SKIP_ATTRS
NULL :=
SPACE := $(NULL) $(NULL)
COMMA := ,
TEST_SKIP_FLAGS := -a $(subst $(SPACE),$(COMMA),$(patsubst %,!%,$(TEST_SKIP_ATTRS)))
endif

TEST_FLAGS = --cover-package=dt_mobile_signing_web --with-xcoverage --with-xunit -v $(TEST_SKIP_FLAGS)

ensure_pip:
	pip install -U 'pip>=7' $(PIP_INDEX)

logs:
	-sudo mkdir -p /var/log/dt-api
	sudo chmod -R 777 /var/log/dt-api

config:
	dtconfig_teardown
	sudo mkdir -p /opt/dealertrack/config/current
	sudo chmod -R 777 /opt/dealertrack/config/current
	dtconfig_setup
	dtconfig-data-opt dev_local
	dtconfig-data-local dev_local
	#dt20db_restore && dt20db_restore_honda

install: ensure_pip
	pip install versiontools $(PIP_FLAGS)
	eval time pip install -r requires_install.txt $(PIP_FLAGS)
	eval time pip install -r requires_tests.txt $(PIP_FLAGS)
	pip freeze

uninstall:
	-pip uninstall dtplatform -y

upload:
	#python setup.py sdist upload -r snapshot

flake8:
	-eval time flake8 dt_mobile_signing_web --ignore=E501 --exclude=env/*,*_tables.py,*_tables_old.py,.git > flake8.out

check: flake8

test:
	eval time $(TEST_ENV) $(TEST) $(TEST_FLAGS) dt_mobile_signing_web
build-no-upload: uninstall install logs config test check

build: build-no-upload upload

pyclean:
	-find . -name '*.pyc' -print0 | xargs -0 rm -f
	-find . -name '*.pyo' -print0 | xargs -0 rm -f
	-find . -name '__pycache__' -type d -print0 | xargs -0 rm -rf

importanize:
	# valid python module name with slash to keep path..
	# https://docs.python.org/2/reference/lexical_analysis.html#identifiers
	-git status | grep -Eo "[A-Za-z0-9_/]+[.]py" | xargs importanize

