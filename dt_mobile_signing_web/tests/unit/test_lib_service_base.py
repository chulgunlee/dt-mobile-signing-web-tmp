"""
Test the functions under signingroom.lib
"""

import mock
import json

from mock import Mock
from tests.test_bases import SigningWebUnitTest
from django.core.exceptions import ImproperlyConfigured

from signingroom.lib.service_base import *


class TestLibServiceBaseInit(SigningWebUnitTest):

    def setUp(self):
        super(TestLibServiceBaseInit, self).setUp()

    def tearDown(self):
        pass

    @mock.patch('signingroom.lib.service_base.settings')
    def test_init_success(self, mock_settings):
    
        test_context = { 'context': 'test-context' }
        test_uri = 'test_uri'
        test_verify = False

        mock_settings.TEST_URI = test_uri
        mock_settings.VERIFY_WS_CERT = test_verify

        class TestService(ServiceBase):
            SETTING_KEY = 'TEST_URI'

        test_service = TestService(test_context)

        self.assertEqual(test_service.server_uri, test_uri)
        self.assertEqual(test_service.verify, test_verify)
        self.assertDictEqual(test_service.context, test_context)
        

    @mock.patch('signingroom.lib.service_base.settings')
    def test_init_improperly_configured(self, mock_settings):

        test_context = { 'context': 'test-context' }
        del mock_settings.TEST_URI

        class TestService(ServiceBase):
            SETTING_KEY = 'TEST_URI'

        with self.assertRaises(ImproperlyConfigured):
            test_servcie = TestService(test_context)
            


class TestLibServiceBase(SigningWebUnitTest):
    
    def setUp(self):
        super(TestLibServiceBase, self).setUp()
        self.context = { 
            'dealer_code': 12345,
            'tenant_code': 'DTCOM',
            'fusion_prod_code': 'DTCOM',
        }

        class TestService(ServiceBase):
            SETTING_KEY = 'TEST_URI'

        with mock.patch('signingroom.lib.service_base.settings', TEST_URI='http://test_uri', VERIFY_WS_CERT=False):
            self.test_service = TestService(self.context)

    def tearDown(self):
        pass

    def _make_response(self, status_code, obj={}):
        """
        Prepare response object for testing process_response
        Do not assign `obj` when status_code >= 400; it will be assigned automatically
        """
        response = Mock()
        response.headers = {'content-type': 'application/json'}
        response.status_code = status_code

        if status_code >= 400:
            obj = {'status_code': status_code, 'message': '%d error' % status_code}

        response.text = json.dumps(obj)
        response.json.return_value = obj

        return response
        
    
    def test_url(self):
        self.assertEqual(self.test_service._url('/path'), 'http://test_uri/path')
        self.assertEqual(self.test_service._url('/resources/%d/', 123), 'http://test_uri/resources/123/')
        self.assertEqual(self.test_service._url('/resources/%d/subres/%d/', 123, 345), 'http://test_uri/resources/123/subres/345/')

    def test_headers(self):
        self.assertDictEqual(self.test_service._headers(), {
            'DEALER-CODE': 12345,
            'TENANT-CODE': 'DTCOM',
            'FUSION-PROD-CODE': 'DTCOM',
            'Accept': 'application/json',
        })

    def test_process_response_400(self):
        response = self._make_response(400)
        with self.assertRaises(BadRequest) as cm:
            self.test_service.process_response(response)

        self.assertEqual(cm.exception.status_code, 400)
        self.assertEqual(cm.exception.detail, '400 error')

    def test_process_response_401(self):
        response = self._make_response(401)
        with self.assertRaises(Unauthorized) as cm:
            self.test_service.process_response(response)

        self.assertEqual(cm.exception.status_code, 401)
        self.assertEqual(cm.exception.detail, '401 error')
        
    def test_process_response_403(self):
        response = self._make_response(403)
        with self.assertRaises(Forbidden) as cm:
            self.test_service.process_response(response)

        self.assertEqual(cm.exception.status_code, 403)
        self.assertEqual(cm.exception.detail, '403 error')
        
    def test_process_response_404(self):
        response = self._make_response(404)
        with self.assertRaises(NotFound) as cm:
            self.test_service.process_response(response)

        self.assertEqual(cm.exception.status_code, 404)
        self.assertEqual(cm.exception.detail, '404 error')

    def test_process_response_405(self):
        response = self._make_response(405)
        with self.assertRaises(MethodNotAllowed) as cm:
            self.test_service.process_response(response)

        self.assertEqual(cm.exception.status_code, 405)
        self.assertEqual(cm.exception.detail, '405 error')
        
    def test_process_response_500(self):
        response = self._make_response(500)
        with self.assertRaises(InternalServerError) as cm:
            self.test_service.process_response(response)

        self.assertEqual(cm.exception.status_code, 500)
        self.assertEqual(cm.exception.detail, '500 error')
        
    def test_process_response_502(self):
        response = self._make_response(502)
        with self.assertRaises(BadGateway) as cm:
            self.test_service.process_response(response)

        self.assertEqual(cm.exception.status_code, 502)
        self.assertEqual(cm.exception.detail, '502 error')
        
    def test_process_response_504(self):
        response = self._make_response(504)
        with self.assertRaises(GatewayTimeout) as cm:
            self.test_service.process_response(response)

        self.assertEqual(cm.exception.status_code, 504)
        self.assertEqual(cm.exception.detail, '504 error')
        
    def test_process_response_ok(self):
        test_data = {'test': 'result'}
        response = self._make_response(200, test_data)

        result = self.test_service.process_response(response)
        self.assertDictEqual(result, test_data)


@mock.patch('signingroom.lib.service_base.requests')
class TestLibServiceBaseHttpMethods(SigningWebUnitTest):
    
    def setUp(self):
        super(TestLibServiceBaseHttpMethods, self).setUp()
        self.context = { 
            'dealer_code': 12345,
            'tenant_code': 'DTCOM',
            'fusion_prod_code': 'DTCOM',
        }

        class TestService(ServiceBase):
            SETTING_KEY = 'TEST_URI'

        with mock.patch('signingroom.lib.service_base.settings', TEST_URI='http://test_uri', VERIFY_WS_CERT=False):
            self.test_service = TestService(self.context)

        self.headers = {'header':'value'}
        self.url = 'http://base_url'

        self.test_service._url = Mock(return_value=self.url)
        self.test_service._headers = Mock(return_value=self.headers)
        self.test_service.process_response = Mock(return_value=None)

    def tearDown(self):
        pass

    def test_get(self, mock_requests):
        self.test_service.get('/url/')
        mock_requests.get.assert_called_with(self.url, headers=self.headers, params=None, verify=False)

        params = {'arg1':'value1'}
        self.test_service.get('/url/', params=params)
        mock_requests.get.assert_called_with(self.url, headers=self.headers, params=params, verify=False)

    def test_post(self, mock_requests):
        self.test_service.post('/url/', data=None)
        mock_requests.post.assert_called_with(self.url, data=None, headers=self.headers, params=None, verify=False)

        self.test_service.post('/url/', data='abc')
        mock_requests.post.assert_called_with(self.url, data='"abc"', headers=self.headers, params=None, verify=False)

        params = {'arg1':'value1'}
        self.test_service.post('/url/', data='abc', params=params)
        mock_requests.post.assert_called_with(self.url, data='"abc"', headers=self.headers, params=params, verify=False)

    def test_put(self, mock_requests):
        self.test_service.put('/url/', data=None)
        mock_requests.put.assert_called_with(self.url, data=None, headers=self.headers, params=None, verify=False)

        self.test_service.put('/url/', data='abc')
        mock_requests.put.assert_called_with(self.url, data='"abc"', headers=self.headers, params=None, verify=False)

        params = {'arg1':'value1'}
        self.test_service.put('/url/', data='abc', params=params)
        mock_requests.put.assert_called_with(self.url, data='"abc"', headers=self.headers, params=params, verify=False)

    def test_delete(self, mock_requests):
        self.test_service.delete('/url/')
        mock_requests.delete.assert_called_with(self.url, headers=self.headers, params=None, verify=False)

        params = {'arg1':'value1'}
        self.test_service.delete('/url/', params=params)
        mock_requests.delete.assert_called_with(self.url, headers=self.headers, params=params, verify=False)
