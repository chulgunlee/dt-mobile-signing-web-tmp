"""
Settings for dev_test environment.
"""

from .base import *  # noqa


DEBUG = True
VERIFY_WS_CERT = False


# mobile server api uri
MOBILE_SERVER_URI = 'https://ws.di.dealertrack.com/api/mobile'
DOCCENTER_URI = 'http://10.135.0.112:6112/api/doccenter'

# doc center api uri
DOCCENTER_SERVER_URI = ''
