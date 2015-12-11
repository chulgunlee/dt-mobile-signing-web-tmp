.PHONY: all build

PIP_INDEX = -i http://10.134.8.12:8000/simple/

PKGNAME = $(shell python -c "import json; print json.load(open('package.json'))['name']")
VERSION = $(shell python -c "import json; print json.load(open('package.json'))['version']")

# use static package name
PKGFILE := $(PKGNAME)-deploy.tar.gz

all: build

$(PKGNAME)/env:
	virtualenv $(PKGNAME)/env
	$(PKGNAME)/env/bin/pip install -r requires_install.txt $(PIP_INDEX)
	$(PKGNAME)/env/bin/dtconfig-data-local dev_local

$(PKGFILE): $(PKGNAME)/env
	tar czf $(PKGFILE) --exclude-vcs --exclude-from=.buildignore $(PKGNAME)

build: $(PKGFILE)

clean:
	rm -rf $(PKGFILE)
