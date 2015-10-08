"""
Django settings for signingroom project.
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
import logging.config
from rest_framework import ISO_8601
from dtplatform.conf import settings as platform_settings          # TODO: restore dtplatform settings

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []
TEMPLATE_DEBUG = DEBUG
#MAIN_DB_CONNECTION_KEY = 'Deal'



# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.8/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '!)8jshnj*q(+bq$#dv-3=w4^^hz4mup3gmdovl*ys!w9%@+$(+'

MIDDLEWARE_CLASSES = (
    'doorman_middleware.tenant_middleware.TenantMiddleware',                            # TODO: restore dtplatform settings
    'django_tenant_templates.middleware.TenantMiddleware',
    'django.middleware.common.CommonMiddleware',
    'dt_django_base.core.middleware.context_middleware.ContextMiddleware',              # TODO: restore dtplatform settings
    #'dt_django_base.core.middleware.sqlalchemy_middleware.SQLAlchemyMiddleware',        # TODO: restore dtplatform settings
)


ROOT_URLCONF = 'signingroom.urls'

WSGI_APPLICATION = 'signingroom.wsgi.application'

# Application definition

INSTALLED_APPS = (
    'signingroom.doclist',
    'signingroom.signingroom',
    'signingroom.api',
    'rest_framework',
    'dt_django_base',
)

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates"
    # or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.abspath(os.path.join(BASE_DIR, 'templates')),
)


# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(BASE_DIR, 'static'),             # TODO: DUMMY DIR TO bypass dt_django_base SQLTAP issue
)

# SQLTap
SQLTAP_ENABLED = os.environ.get('SQLTAP_ENABLED', False)



# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases

DATABASES = {}


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
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DATETIME_FORMAT': ISO_8601,
    'PAGINATE_BY': 100,
    'PAGINATE_BY_PARAM': 'page_size',
    'MAX_PAGINATE_BY': 1000,
    'DATE_INPUT_FORMATS': (
        ISO_8601,
        "%m/%d/%Y",
    ),
#    'EXCEPTION_HANDLER': 'dt_django_base.api.exceptions.custom_exception_handler',
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
        'signingweb': {'format': ('"%(asctime)s", "dt_mobile_signing_web", "[%(levelname)s]", "%(corelation_id)s",'
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
            'filename': '/var/log/dt-mobile-signing-web/dt-mobile-signing-web.log',
            'maxBytes': 1024 * 1024 * 5,  # 5 MB
            'backupCount': 5,
            'formatter': 'signingweb',
        },
        'signingweb_console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'signingweb'
        },
        'syslog': {
            'level': 'NOTSET',
            'class': 'logging.handlers.SysLogHandler',
            'address': '/dev/dt-mobile-signing-web-log',
            'facility': 'local5',
            'formatter': 'signingweb',
        },
    },
    'loggers': {
        'django.request': {
            'handlers': ['signingweb_console'],
            'level': 'WARNING',
            'propagate': True,
        },
        'dt_mobile_signing_web': {
            'handlers': ['syslog'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
LOGGING_EXTRA_DATA = platform_settings.LOGGING_EXTRA_DATA.copy()           # TODO: restore dtplatform settings

logging.config.dictConfig(LOGGING)

