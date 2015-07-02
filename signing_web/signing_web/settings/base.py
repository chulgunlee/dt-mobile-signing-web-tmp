"""
Django settings for signing_web project.
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
import logging.config
from rest_framework import ISO_8601
from dtplatform.conf import settings as platform_settings

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.8/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '!)8jshnj*q(+bq$#dv-3=w4^^hz4mup3gmdovl*ys!w9%@+$(+'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = (
    'rest_framework',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
)

ROOT_URLCONF = 'signing_web.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'signing_web.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}


# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/

STATIC_URL = '/static/'

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        'dt_django_base.api.renderers.DealerTrackAPIRenderer',
    ),
    'DATETIME_FORMAT': ISO_8601,
    'PAGINATE_BY': 100,
    'PAGINATE_BY_PARAM': 'page_size',
    'MAX_PAGINATE_BY': 1000,
    'DATE_INPUT_FORMATS': (
        ISO_8601,
        "%m/%d/%Y",
    ),
    'EXCEPTION_HANDLER': 'dt_django_base.api.exceptions.custom_exception_handler',
}
 
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
    },
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(levelname)s]'
                      ' %(name)s: %(message)s'
        },
        'dtapi': {'format': ('"%(asctime)s", "doc_center_api", "[%(levelname)s]", "%(corelation_id)s",'
                             ' "%(tenant_code)s", "%(fusion_prod_code)s",'
                             ' "%(branding_id)s", "%(branding_folder)s",'
                             ' "%(feature_code)s", "%(functional_area)s",'
                             ' "%(short_event_name)s", "%(error_type)s", "%(route_name)s", "%(url)s",'
                             ' "%(name)s", "%(filepath)s", "%(pathname)s", "%(process)d", "%(processName)s",'
                             ' "%(thread)d", "%(threadName)s", "%(funcName)s", "%(lineno)d",'
                             ' "%(session_id)s", "%(client_ip)s", "%(login_id)s",'
                             ' "%(user_code)s", "%(user_type)s", "%(dealer_code)s",'
                             ' "%(user_lender_id)s", "%(browser_type)s",'
                             ' "%(partner_id)s", "%(partner_code)s", "%(deal_jacket_id)s", "%(deal_id)s",'
                             ' "%(app_id)s", "%(lender_app_id)s",'
                             ' "%(message)s", "%(full_form)s", "%(form)s"'),
                  'datefmt': '%Y-%m-%d %H:%M:%S'}
    },

    'handlers': {
        'default': {
            'level': 'NOTSET',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/dt-api/doc_center_api.log',
            'maxBytes': 1024 * 1024 * 5,  # 5 MB
            'backupCount': 5,
            'formatter': 'dtapi',
        },
        'dtapi_console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'dtapi'
        },
        'syslog': {
            'level': 'NOTSET',
            'class': 'logging.handlers.SysLogHandler',
            'address': '/dev/dtapi-log',
            'facility': 'local5',
            'formatter': 'dtapi',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'standard'
        },
    },
    'loggers': {
        'django.request': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': True,
        },
        'doc_center_api': {
            'handlers': ['syslog'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
LOGGING_EXTRA_DATA = platform_settings.LOGGING_EXTRA_DATA.copy()

logging.config.dictConfig(LOGGING)

