#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
    deploy_env = os.environ.get("DEPLOY_ENVIRONMENT", "dev_local")
    os.environ["DJANGO_SETTINGS_MODULE"] = "signingroom.settings." + deploy_env

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
