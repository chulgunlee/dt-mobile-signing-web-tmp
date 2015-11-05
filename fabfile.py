import os
import sys
import json
import random
import string

from fabric.api import run, env, local, lcd, execute, put, prefix, cd, sudo
from fabric.contrib.files import exists
from fabric.decorators import task

BASEDIR = os.path.abspath(os.path.dirname(__file__))
sys.path.insert(0, BASEDIR)

env.deploy_dest = '/opt'
env.pkgname = 'dt-mobile-signing-web'

@task
def build():

    (pkgname, version) = get_pkg_version()
    jenkins_build_number = os.environ.get('BUILD_NUMBER')

    if jenkins_build_number is not None:
        # build in jenkins
        pkgfile = '%s-%s-%s.tar.gz' % (pkgname, version, jenkins_build_number)
    else:
        # build manually
        pkgfile = '%s-%s.tar.gz' % (pkgname, version)

    # if virtualenv is not setup (by jenkins), install it
    if not os.path.isdir('.env'):
        local('virtualenv .env')
        local('/bin/bash .env/bin/activate && .env/bin/pip install -r requires_install.txt')
    
    # make build directory
    local('mkdir -p build')

    # make tar command
    cmds = ['tar', 'czf']
    cmds.append('./build/%s' % pkgfile)

    if os.path.isfile('.buildignore'):
        cmds.append('--exclude-from=.buildignore')

    cmds.append('--exclude-vcs')
    cmds.append('--transform="s|^\./|%s/|"' % pkgname)
    cmds.append('.')

    cmd = ' '.join(cmds)

    # make package
    local(cmd)




@task
def clean():
    """
    Clean packages.
    """
    local('rm -rf .env')
    local('rm -rf build')


def get_pkg_version():
    """
    get package name and version from repo
    only valid when run in a repo
    """
    pkgfile = 'package.json'

    try:
        pkginfo = json.load(open(pkgfile))
        version = pkginfo.get('version')
        pkgname = pkginfo.get('name')

        return (pkgname, version)

    except Exception as e:
        print "Warning: cannot load %s, %s" % (pkgfile, e)

    return (env.pkgname, 'unknown')
    

@task
def release():
    # Get version number
    pkg_name, pkg_version = get_pkg_version()
    major, minor, patch = pkg_version.split('.')
    suggested_new_version = '.'.join([str(major), str(minor), str(int(patch) + 1)])
    new_version_prompt = 'New version number? (Default: {})'.format(suggested_new_version)
    new_version = raw_input(new_version_prompt) or suggested_new_version

    # Run grunt
    local('grunt build')

    # Update version number after grunt has run successfully
    package_info = json.load(open('package.json'))
    package_info['version'] = new_version
    json.dump(package_info, open('package.json', 'w'), indent=2, sort_keys=True)

    # Show git status output
    local('git status')

    print '\n\n\tPlease review the changes and run `$ git commit` to finish this release.'
