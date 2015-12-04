import logging
import six
from django.conf import settings

class SigningWebLoggingFilter(logging.Filter):
    """Logging filter for injecting LOGGING_EXTRA_DATA into log record.
    """
    
    def filter(self, record):
        "Inject LOGGING_EXTRA_DATA into log record"

        for k, v in six.iteritems(settings.LOGGING_EXTRA_DATA):
            if not hasattr(record, k):
                setattr(record, k, v)
        return True


