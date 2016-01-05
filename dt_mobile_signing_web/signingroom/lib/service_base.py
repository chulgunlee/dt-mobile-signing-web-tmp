import requests
import logging
import json
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from rest_framework.exceptions import APIException


logger = logging.getLogger('dt_mobile_signing_web')

class BadRequest(APIException):
    status_code = 400
    default_detail = 'Bad Request'


class Unauthorized(APIException):
    status_code = 401
    default_detail = 'Unauthorized'


class Forbidden(APIException):
    status_code = 403
    default_detail = 'Forbidden'


class NotFound(APIException):
    status_code = 404
    default_detail = 'Not Found'


class MethodNotAllowed(APIException):
    status_code = 405
    default_detail = 'Method Not ALlowed'


class InternalServerError(APIException):
    status_code = 500
    default_detail = 'Internal Server Error'


class BadGateway(APIException):
    status_code = 502
    default_detail = 'Bad Gateway'


class ServiceUnavailable(APIException):
    status_code = 503
    default_detail = 'Service Unavailable'


class GatewayTimeout(APIException):
    status_code = 504
    default_detail = 'Gateway Timeout'


class BadContentType(APIException):
    status_code = 500
    default_detail = 'Bad Content Type'


class ServiceBase(object):
    """Base class for lib classes that access internal backedn services
    """

    SETTING_KEY = ''

    def __init__(self, context):
        try:
            self.server_uri = getattr(settings, self.SETTING_KEY)
            self.context = context

            self.verify = getattr(settings, 'VERIFY_WS_CERT', True)

        except Exception as e:
            raise ImproperlyConfigured('%s not specified: %s' % (self.SETTING_KEY,  e))

    def _url(self, path, *args):
        """Generate service URL
        """
        return self.server_uri + path % args

    def _headers(self, custom_headers=None):
        """Generate headers from client API call for web service
        """
        headers = {
            'DEALER-CODE': self.context.get('dealer_code'),
            'TENANT-CODE': self.context.get('tenant_code'),
            'FUSION-PROD-CODE': self.context.get('fusion_prod_code'),
            'Accept': 'application/json',
        }

        if 'user_code' in self.context:
            headers['USER-CODE'] = self.context.get('user_code')

        if custom_headers:
            headers.update(custom_headers)

        return headers

    def get(self, path, params=None, headers=None):
        """Wrapper for sending GET request through dt_requests.

        Args:
            path: API path
            params: query params dict

        Returns:
            json object (in python representive); or raise exception if server fails
        """

        headers = self._headers(headers)
        url = self._url(path)

        response = requests.get(url, headers=headers, params=params, verify=self.verify)

        logger.info('GET %s, params=%s, status_code=%s, response_length=%s' % (url, params, response.status_code, len(response.text)), extra=dict(short_event_name='service_base.get'))

        return self.process_response(response)

    def post(self, path, data, params=None, headers=None):
        """Wrapper for sending POST request through dt_requests.

        Args:
            path: API path
            data: post data object; will be sent as 'application/json'
            params: query params dict

        Returns:
            json object (in python representive); or raise exception if server fails
        """

        headers = self._headers(headers)
        url = self._url(path)

        data = json.dumps(data) if data is not None else None
        headers['Content-Type'] = 'application/json'

        response = requests.post(url, data=data, headers=headers, params=params, verify=self.verify)

        logger.info('POST %s, status_code=%s, response_length=%s' % (url, response.status_code, len(response.text)), extra=dict(short_event_name='service_base.post'))

        return self.process_response(response)

    def put(self, path, data, params=None, headers=None):
        """Wrapper for sending PUT request through dt_requests.

        Args:
            path: API path
            data: put data object; will be sent as 'application/json'
            params: query params dict

        Returns:
            json object (in python representive); or raise exception if server fails
        """

        headers = self._headers(headers)
        url = self._url(path)

        data = json.dumps(data) if data is not None else None
        headers['Content-Type'] = 'application/json'

        response = requests.put(url, data=data, headers=headers, params=params, verify=self.verify)

        logger.info('PUT %s, status_code=%s, response_length=%s' % (url, response.status_code, len(response.text)), extra=dict(short_event_name='service_base.put'))

        return self.process_response(response)

    def delete(self, path, params=None, headers=None):
        """Wrapper for sending DELETE request through dt_requests.

        Args:
            path: API path
            params: query params dict

        Returns:
            json object (in python representive); or raise exception if server fails
        """

        headers = self._headers(headers)
        url = self._url(path)

        response = requests.delete(url, headers=headers, params=params, verify=self.verify)

        logger.info('DELETE %s, params=%s, status_code=%s, response_length=%s' % (url, params, response.status_code, len(response.text)), extra=dict(short_event_name='service_base.delete'))

        return self.process_response(response)

    def process_response(self, response):
        """Process http response

        Args:
            response: HTTP response returned by `requests` library

        Returns:
            Parsed object if server returns 200
            None if server returns 204
            raise Exceptions if server fails (4xx or 5xx)
        """

        error_detail = None

        content_type = response.headers.get('content-type')
        if content_type == 'application/json':
            result = response.json()

            if 'status_code' in result:
                # workaround for the DTMobile status_code issue       FIXME FIXME
                response.status_code = result['status_code']

                error_detail = result.get('message')

        # 401 is returned by siteminder and will not have a json body
        if response.status_code == 401:
            raise Unauthorized(error_detail)

        # 403 is normally impossible. if this happens there must be a env bug
        elif response.status_code == 403:
            raise Forbidden(error_detail)

        # nginx cannot connect to backend wsgi service
        elif response.status_code == 502:
            raise BadGateway(error_detail)

        # wsgi service timeout
        elif response.status_code == 504:
            raise GatewayTimeout(error_detail)

        elif response.status_code == 503:
            raise ServiceUnavailable(error_detail)

        elif response.status_code == 404:
            raise NotFound(error_detail)

        elif response.status_code == 400:
            raise BadRequest(error_detail)

        elif response.status_code == 405:
            raise MethodNotAllowed(error_detail)

        elif response.status_code == 500:
            raise InternalServerError(error_detail)

        # No content
        elif response.status_code == 204:
            return

        elif content_type == 'application/json':
            return response.json()

        else:
            return response
