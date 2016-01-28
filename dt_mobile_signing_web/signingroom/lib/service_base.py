import requests
import logging
import json
from urllib import urlencode
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
            raise ImproperlyConfigured('%s not specified: %s' % (self.SETTING_KEY, e))

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

    def request(self, method, path, params=None, headers=None, data=None):
        """
        Wrapper for sending request through requests.

        Args:
            path: API path
            data: put data object; will be sent as 'application/json'
            params: query params dict

        Returns:
            json object (in python representive); or raise exception if server fails
        """

        headers = self._headers(headers)
        url = self._url(path)

        if data is not None:
            data = json.dumps(data)
            headers['Content-Type'] = 'application/json'

        resp = requests.request(method, url, params=params, headers=headers, data=data, verify=self.verify)

        if params:
            url = '%s?%s' % (url, urlencode(params))
        logger.info('%s %s, headers=%s, data=%s, status=%s, response_lenght=%s' % (method, url, headers, data, resp.status_code, len(resp.text)), extra=dict(short_event_name='service_base.%s' % method.lower()))

        return self.process_response(resp)

    def get(self, path, params=None, headers=None):
        """Wrapper for sending GET request.

        Args:
            path: API path
            params: query params dict

        Returns:
            json object (in python representive); or raise exception if server fails
        """

        return self.request('GET', path, params=params, headers=headers)

    def post(self, path, data, params=None, headers=None):
        """Wrapper for sending POST request through.

        Args:
            path: API path
            data: post data object; will be sent as 'application/json'
            params: query params dict

        Returns:
            json object (in python representive); or raise exception if server fails
        """

        return self.request('POST', path, params=params, headers=headers, data=data)

    def put(self, path, data, params=None, headers=None):
        """Wrapper for sending PUT request.

        Args:
            path: API path
            data: put data object; will be sent as 'application/json'
            params: query params dict

        Returns:
            json object (in python representive); or raise exception if server fails
        """

        return self.request('PUT', path, params=params, headers=headers, data=data)

    def delete(self, path, params=None, headers=None):
        """Wrapper for sending DELETE request through dt_requests.

        Args:
            path: API path
            params: query params dict

        Returns:
            json object (in python representive); or raise exception if server fails
        """

        return self.request('DELETE', path, params=params, headers=headers)

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
