import logging
import urlparse

from django.conf import settings
from django.core.exceptions import PermissionDenied
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.views.generic import View
from requests.exceptions import Timeout
from rest_framework import status

from dtplatform.utils import dt_requests


logger = logging.getLogger('dtweb.' + __name__)
log_data = settings.LOGGING_EXTRA_DATA.copy()


class ServicesProxyView(View):

    """
    Generic proxy to pass request to DTServices
    """
    scheme = settings.SERVICES_PROXY_SCHEME
    hostname = settings.SERVICES_PROXY_HOST
    port = settings.SERVICES_PROXY_PORT

    meta_non_http_headers = ('CONTENT_TYPE',)
    context_headers = ('dealer_code',
                       'tenant_code',
                       'fusion_prod_code',
                       'user_code',)

    # taken from http://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html
    http_hop_headers = ('connection',
                        'keep-alive',
                        'proxy-authenticate',
                        'proxy-authorization',
                        'te',
                        'trailers',
                        'transfer-encoding',
                        'upgrade')
    http_method_names = ('get',
                         'post',
                         'put',
                         'patch',
                         'delete',
                         'head',
                         'options')
    http_payload_methods = ('post',
                            'put',
                            'patch')

    def is_path_whitelisted(self, path):
        """
        Check weather URI is present in the white listed endpoint
        and return the boolean.

        :param path: URLconfig kwarg parameter path
        """
        return any((path.startswith(w) for w in settings.SERVICES_PROXY_WHITELIST))

    @method_decorator(csrf_protect)
    def dispatch(self, request, *args, **kwargs):
        """
        Same as Django's dispatch except CSRF is applied
        """
        # validate the request
        # this can either raise an exception
        # or return a response
        # in either case proxy should not proceed
        validation = self.validate_request(request, *args, **kwargs)
        if validation:
            return validation
        return super(ServicesProxyView, self).dispatch(request, *args, **kwargs)

    def validate_request(self, request, *args, **kwargs):
        """
        Validate request in a sense that we are capable of
        passing this request to the services.
        """
        if not self.is_path_whitelisted(kwargs['path']):
            raise PermissionDenied

        # form data cannot be passed to dt_requests
        # hence reject any requests
        if 'form-data' in request.META.get('CONTENT_TYPE', ''):
            return HttpResponse(status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)

    def dispatch_requests(self, response):
        """
        Return Django HttpResponse with the data as returned
        by using requests
        """
        dresponse = HttpResponse(response.content,
                                 status=response.status_code)

        for header, value in response.headers.items():
            # Python's WSGI server does not allow for
            # requests to have hop-by-hop headers
            # hence they need to be stripped if present
            if header.lower() in self.http_hop_headers:
                continue

            dresponse[header] = value

        return dresponse

    def get_remote_url(self):
        """
        Get the request url for the remote endpoint.
        """
        return urlparse.urlunparse(urlparse.ParseResult(
            scheme=self.scheme,
            netloc='{}:{}'.format(self.hostname, self.port),
            path=self.request.path,
            params=None,
            query=self.request.GET.urlencode(),
            fragment=None))

    def apply_forwarded_headers(self, headers):
        """
        Add Forwarded headers as expected by a proxy
        as defined in RFC7239 (http://tools.ietf.org/html/rfc7239).
        """
        server_ip = self.request.META.get('SERVER_ADDR', None) or 'unknown'
        remote_ip = self.request.META.get('REMOTE_ADDR', None) or 'unknown'

        # Add X-FORWARDED-BY header
        # the request could of already been forwarded by other proxies
        # hence get the current values and append the current
        # proxy IP if existent, else add unknown
        by_values = headers.get('X-FORWARDED-BY', '').split(',')
        by_values = filter(None, [i.strip() for i in by_values])
        by_values.append(server_ip)

        headers['X-FORWARDED-BY'] = ', '.join(by_values)

        # Add X-FORWARDED-FOR header
        # add the original ip if the
        # request was not forwarded before
        for_values = headers.get('X-FORWARDED-FOR', '').split(',')
        for_values = filter(None, [i.strip() for i in for_values])
        for_values.append(remote_ip)

        headers['X-FORWARDED-FOR'] = ', '.join(for_values)

        headers['X-FORWARDED-PROTO'] = 'https' if self.request.is_secure() else 'http'
        headers['X-FORWARDED-HOST'] = headers.get('HOST', '')

        return headers

    def get_request_headers(self):
        """
        Get headers to be passed with the request
        to the dtservices.
        """
        headers = {}

        for header, value in self.request.META.iteritems():
            # should pass only HTTP headers since Django adds
            # additional, non-relevant for headers information
            # to META such as DJANGO_SETTINGS_MODULE
            # there are some exceptions though which
            # are defined in ``meta_non_http_headers``
            if all([not header.startswith('HTTP'),
                    not header in self.meta_non_http_headers]):
                continue

            # django normalizes headers to use underscores
            # instead of hyphens
            # also remove HTTP_ prefix since django adds
            # that for all HTTP headers
            normalized_header = (header
                                 .replace('HTTP_', '')
                                 .replace('_', '-'))

            # skip if header key is in context data since
            # we will manually copy from context data
            # that can potentially have better value
            # since middleware can modify it
            # but not necessarily HTTP Request header
            lower_normalized_header = normalized_header.lower()
            lower_underscore_header = lower_normalized_header.replace('-', '_')
            if any([lower_normalized_header in self.context_headers,
                    lower_underscore_header in self.context_headers]):
                continue

            headers[normalized_header] = value

        for header in self.context_headers:
            headers[header.upper().replace('_', '-')] = self.request.context_data.get(header)

        headers = self.apply_forwarded_headers(headers)

        return headers

    def proxy(self, request, *args, **kwargs):
        method = self.request.method.lower()
        dt_method = getattr(dt_requests, '{}_json'.format(method))

        request_kwargs = {
            'url': self.get_remote_url(),
            'context': log_data,
            'headers': self.get_request_headers(),
            'timeout': settings.SERVICES_PROXY_TIMEOUT,
        }
        if method in self.http_payload_methods:
            request_kwargs['payload'] = request.read()

        try:
            response = dt_method(**request_kwargs)
        except Timeout:
            msg = 'Services proxy timeout requesting "{}"'
            logger.warning(msg.format(self.request.get_full_path()),
                           extra=request.context_data)
            return HttpResponse(status=status.HTTP_504_GATEWAY_TIMEOUT)

        return self.dispatch_requests(response)

    head = options = post = put = patch = delete = get = proxy
