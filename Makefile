.PHONY: all build

PIP_INDEX = -i http://10.134.8.12:8000/simple/

PKGNAME = $(shell python -c "import json; print json.load(open('package.json'))['name']")
VERSION = $(shell python -c "import json; print json.load(open('package.json'))['version']")

ifdef BUILD_NUMBER
PKGFILE := $(PKGNAME)-$(VERSION)-$(BUILD_NUMBER).tar.gz
else
PKGFILE := $(PKGNAME)-$(VERSION).tar.gz
endif

all: build

env:
	virtualenv env
	env/bin/pip install -r requires_install.txt $(PIP_INDEX)

build/$(PKGFILE): env
	mkdir build && tar czf build/$(PKGFILE) --exclude-vcs --transform="s|^\./|$(PKGNAME)/|" --transform="s|^\.$$|$(PKGNAME)/|" --exclude-from=.buildignore .

build: build/$(PKGFILE)

clean:
	rm -rf build env
