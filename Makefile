.PHONY: all build install

PIP_INDEX = -i http://10.134.8.12:8000/simple/

PKGNAME = dt-mobile-signing-web

# use static package name
PKGFILE := dt-mobile-signing-web-deploy.tar.gz

all: build

$(PKGNAME)/env:
	virtualenv $(PKGNAME)/env
	$(PKGNAME)/env/bin/pip install -r requires_install.txt $(PIP_INDEX)
	$(PKGNAME)/env/bin/dtconfig-data-local dev_local

$(PKGFILE): $(PKGNAME)/env
	tar czf $(PKGFILE) --exclude-vcs --exclude-from=.buildignore $(PKGNAME)

build: $(PKGFILE)

install: $(PKGNAME)/env

clean:
	rm -rf $(PKGFILE)
