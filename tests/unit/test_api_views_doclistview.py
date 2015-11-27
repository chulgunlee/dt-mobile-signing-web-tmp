import mock
import json

from mock import MagicMock, Mock
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.response import Response
from tests.test_bases import SigningWebUnitTest
from dt_django_base.core.test_bases import DRFApiMixin
from signingroom.api.views import DocListView
from signingroom.lib.service_base import *          # NOQA


@mock.patch('signingroom.api.views.get_doccenter_api')
class TestDocListViewGet(DRFApiMixin, SigningWebUnitTest):

    def setUp(self):
        super(TestDocListViewGet, self).setUp()
        self.view = DocListView.as_view()

        self.url_name = 'doclist'
        self.dealjacket_id = '1'
        self.deal_id = '2'

        self.path = reverse(self.url_name, kwargs={'dealjacket_id': self.dealjacket_id, 'deal_id': self.deal_id})

    def tearDown(self):
        pass

    def _make_request(self):
        request = self.request_factory.get(
            path=self.path,
            format='json',
        )
        request.context_data = self.CONTEXT

        return request

    def test_doclist_get_success(self, mock_get_doccenter_api):
        # generate test request
        request = self._make_request()

        # mock backend services
        mock_get_doccenter_api.return_value.get_docs_by_dj_id.return_value = self.load_json('doccenter_get_docs_by_dj_id.json')

        # call view function
        response = self.view(request, self.dealjacket_id, self.deal_id)
        
        # assert http status
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # assert doc attributes
        result = response.data
        self.assertEqual(len(result.get('docs', [])), 3)

        doc = result.get('docs')[0]
        self.assertDictContainsSubset({
            'id': 161,
            'docType': 'contract',
            'templateName': 'eContract',
            'requiredForFunding': True,
            'signable': True,
            'status': 'signed',
            'signStatus': {
                'buyer': True,
                'cobuyer': False,
                'dealer': True,
            },
            'isExternal': False,
        }, doc)

    def test_doclist_get_fail_doclist_404(self, mock_get_doccenter_api):
        "Test when the get doc list failed"
        request = self._make_request()

        mock_get_doccenter_api.return_value.get_docs_by_dj_id.side_effect = NotFound('Not Found')

        # call view function
        response = self.view(request, self.dealjacket_id, self.deal_id)

        # assert http status
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # assert error msg
        result = response.data
        self.assertDictContainsSubset({'status_code': 404, 'message': 'Not Found'}, result)

    def test_doclist_get_fail_doclist_500(self, mock_get_doccenter_api):
        "Test when the get doc list failed"
        request = self._make_request()

        mock_get_doccenter_api.return_value.get_docs_by_dj_id.side_effect = InternalServerError('Internal Server Error')

        # call view function
        response = self.view(request, self.dealjacket_id, self.deal_id)

        # assert http status
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

        # assert error msg
        result = response.data
        self.assertDictContainsSubset({'status_code': 500, 'message': 'Internal Server Error'}, result)
