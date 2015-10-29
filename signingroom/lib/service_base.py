from django.conf import settings
from rest_framework.exceptions import APIException
from django.core.exceptions import ImproperlyConfigured
from dtplatform.utils.dt_requests import get_json, post_json, put_json, delete_json


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

    SETTING_KEY = ''

    def __init__(self, context):
        try:
            self.server_uri = getattr(settings, self.SETTING_KEY)
            self.context = context

            self.verify = getattr(settings, 'VERIFY_WS_CERT', True)

        except Exception as e:
            raise ImproperlyConfigured('%s not specified: %s' % (self.SETTING_KEY,  e))

    def _url(self, path, *args):
        """
        Generate service URL
        """
        return self.server_uri + path % args

    def _headers(self):
        """
        Generate headers from client API call for web service
        TODO: this might be useless because dt_request support context
        """
        return {
            'DEALER-CODE': self.context.get('dealer_code'),
            'TENANT-CODE': self.context.get('tenant_code'),
            'FUSION-PROD-CODE': self.context.get('fusion_prod_code'),
            'Accept': 'application/json',
        }

    def get(self, path, params=None):
        """
        Wrapper for sending GET request through dt_requests.
        """

        headers = self._headers()
        url = self._url(path)
        response = get_json(url, self.context, headers=headers, params=params, verify=self.verify)
        return self.process_response(response)

    def post(self, path, data, params=None):
        headers = self._headers()
        url = self._url(path)

        response = post_json(url, self.context, payload=data, headers=headers, params=params, verify=self.verify)
        return self.process_response(response)

    def put(self, path, data, params=None):
        headers = self._headers()
        url = self._url(path)

        response = put_json(url, self.context, payload=data, headers=headers, params=params, verify=self.verify)
        return self.process_response(response)

    def delete(self, path, params=None):
        """
        Wrapper for sending DELETE request through dt_requests.
        """

        headers = self._headers()
        url = self._url(path)
        response = delete_json(url, self.context, headers=headers, params=params, verify=self.verify)
        return self.process_response(response)

    def process_response(self, response):
        """
        Do nothing if response is success (2xx or 3xx), or raise exception if error happens (4xx or 5xx)
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

        elif content_type != 'application/json':
            raise BadContentType('Server did not return a JSON response: ' + response.text)

        else:
            return response.json()
